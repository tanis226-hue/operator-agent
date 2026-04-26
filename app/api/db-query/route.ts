import { NextResponse } from "next/server";

export const maxDuration = 30;

type DbType = "postgres" | "mysql";

type RequestBody = {
  dbType: DbType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  query: string;
};

function isSelectOnly(sql: string): boolean {
  const normalized = sql.trim().replace(/\s+/g, " ").toLowerCase();
  // Must start with SELECT and must not contain mutating keywords
  if (!normalized.startsWith("select")) return false;
  const blocked = /\b(insert|update|delete|drop|truncate|alter|create|grant|revoke|exec|execute|call)\b/;
  return !blocked.test(normalized);
}

const MAX_ROWS = 500;

/** Wrap the user's query so we always cap rows even if they already have a LIMIT. */
function capRows(sql: string): string {
  return `SELECT * FROM (${sql.trim().replace(/;\s*$/, "")}) AS oa_capped LIMIT ${MAX_ROWS}`;
}

/** Map raw driver errors into friendly, actionable messages. */
function friendlyError(rawMsg: string): string {
  const m = rawMsg.toLowerCase();
  if (m.includes("etimedout") || m.includes("timeout") || m.includes("timed out")) {
    return "Connection timed out. Check that the host is reachable and that your firewall allows the database port.";
  }
  if (m.includes("enotfound") || m.includes("getaddrinfo")) {
    return "Host not found. Double-check the hostname or IP address.";
  }
  if (m.includes("econnrefused")) {
    return "Connection refused. The database isn't accepting connections on that port — verify the port and that the server is running.";
  }
  if (m.includes("password authentication failed") || m.includes("access denied") || m.includes("authentication failed")) {
    return "Authentication failed. Check the username and password.";
  }
  if (m.includes("does not exist") && m.includes("database")) {
    return "Database not found. Check the database name.";
  }
  if (m.includes("relation") && m.includes("does not exist")) {
    return "Table not found in the SELECT. Check the table name and any schema qualifier.";
  }
  if (m.includes("ssl") || m.includes("tls")) {
    return "SSL/TLS error connecting to the database. Some hosts require SSL — try a different host or contact your DBA.";
  }
  if (m.includes("syntax error")) {
    return `SQL syntax error — ${rawMsg.replace(/^.*syntax error/i, "").slice(0, 140).trim() || "check your query"}.`;
  }
  // Strip credential echoes from any other message
  const safe = rawMsg.replace(/password[^,)]*/gi, "***").replace(/user[^,)]*/gi, "***");
  return `Connection failed: ${safe.slice(0, 200)}`;
}

function rowsToText(
  columns: string[],
  rows: Record<string, unknown>[]
): string {
  const header = columns.join("\t");
  const body = rows
    .map((r) => columns.map((c) => String(r[c] ?? "")).join("\t"))
    .join("\n");
  return `${header}\n${body}`;
}

async function runPostgres(body: RequestBody): Promise<string> {
  const { Client } = await import("pg");
  const client = new Client({
    host: body.host,
    port: body.port,
    database: body.database,
    user: body.username,
    password: body.password,
    connectionTimeoutMillis: 8000,
    query_timeout: 15000,
    ssl: body.host !== "localhost" && body.host !== "127.0.0.1"
      ? { rejectUnauthorized: false }
      : undefined,
  });
  await client.connect();
  try {
    const result = await client.query(capRows(body.query));
    const columns = result.fields.map((f) => f.name);
    return rowsToText(columns, result.rows as Record<string, unknown>[]);
  } finally {
    await client.end();
  }
}

async function runMysql(body: RequestBody): Promise<string> {
  const mysql = await import("mysql2/promise");
  const conn = await mysql.createConnection({
    host: body.host,
    port: body.port,
    database: body.database,
    user: body.username,
    password: body.password,
    connectTimeout: 8000,
    ssl: body.host !== "localhost" && body.host !== "127.0.0.1"
      ? { rejectUnauthorized: false }
      : undefined,
  });
  try {
    const [rows, fields] = await conn.execute(capRows(body.query));
    const fieldList = (fields as Array<{ name: string }>).map((f) => f.name);
    return rowsToText(fieldList, rows as Record<string, unknown>[]);
  } finally {
    await conn.end();
  }
}

function sanitize(body: RequestBody): string | null {
  if (!body.host?.trim()) return "Host is required.";
  if (!body.database?.trim()) return "Database name is required.";
  if (!body.username?.trim()) return "Username is required.";
  if (!body.query?.trim()) return "Query is required.";
  if (!isSelectOnly(body.query)) return "Only SELECT queries are allowed.";
  return null;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validationError = sanitize(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    let tsv: string;
    if (body.dbType === "mysql") {
      tsv = await runMysql(body);
    } else {
      tsv = await runPostgres(body);
    }

    const rowCount = tsv.split("\n").length - 1; // subtract header
    return NextResponse.json({ tsv, rowCount });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: friendlyError(msg) }, { status: 500 });
  }
}
