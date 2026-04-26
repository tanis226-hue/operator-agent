import { Resend } from "resend";

export async function POST(request: Request): Promise<Response> {
  const apiKey = (process.env.RESEND_API_KEY ?? "").trim();
  if (!apiKey || apiKey === "your_resend_key_here") {
    return Response.json(
      { error: "RESEND_API_KEY is not configured." },
      { status: 500 }
    );
  }

  let body: { email?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const audienceId = (process.env.RESEND_AUDIENCE_ID ?? "").trim();
  const ownerEmail = (process.env.OWNER_EMAIL ?? "").trim();
  const fromAddress =
    (process.env.RESEND_FROM_EMAIL ?? "").trim() ||
    "Operator Agent <onboarding@resend.dev>";

  // Add to Resend Audience contact list (if configured)
  if (audienceId) {
    try {
      await resend.contacts.create({ email, audienceId, unsubscribed: false });
    } catch {
      // Non-fatal — continue so the owner notification still fires
    }
  }

  // Notify owner (if configured)
  if (ownerEmail) {
    try {
      await resend.emails.send({
        from: fromAddress,
        to: [ownerEmail],
        subject: `New waitlist sign-up: ${email}`,
        html: `<p style="font-family:sans-serif;font-size:14px;color:#333">
          <strong>${email}</strong> just joined the Operator Agent waitlist.<br><br>
          Time: ${new Date().toUTCString()}
        </p>`,
      });
    } catch {
      // Non-fatal
    }
  }

  return Response.json({ ok: true });
}
