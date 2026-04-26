import { Resend } from "resend";
import type { GeneratedOutputPayload } from "@/lib/outputTypes";
import type { IntakeBrief } from "@/lib/intakeBrief";

export const maxDuration = 30;

function e(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type SenderProfile = {
  name: string;
  credentials: string;
  title: string;
  tagline: string;
  email: string;
  website: string;
  websiteLabel: string;
  linkedin: string;
  photoFile: string;
  noteIntro: string;
  noteBody: string;
};

function loadSenderProfile(): SenderProfile | null {
  const name = (process.env.SENDER_NAME ?? "").trim();
  const email = (process.env.SENDER_EMAIL ?? "").trim();
  // Both name and email are required to render the signature block.
  // If either is missing, the signature is omitted entirely.
  if (!name || !email) return null;
  return {
    name,
    credentials: (process.env.SENDER_CREDENTIALS ?? "").trim(),
    title: (process.env.SENDER_TITLE ?? "").trim(),
    tagline: (process.env.SENDER_TAGLINE ?? "").trim(),
    email,
    website: (process.env.SENDER_WEBSITE ?? "").trim(),
    websiteLabel: (process.env.SENDER_WEBSITE_LABEL ?? "").trim(),
    linkedin: (process.env.SENDER_LINKEDIN ?? "").trim(),
    photoFile: (process.env.SENDER_PHOTO_FILE ?? "").trim(),
    noteIntro: (process.env.SENDER_NOTE_INTRO ?? `A note from ${name.split(" ")[0]}`).trim(),
    noteBody: (process.env.SENDER_NOTE_BODY ?? "").trim(),
  };
}

function buildEmailHtml(brief: IntakeBrief, g: GeneratedOutputPayload): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  const sender = loadSenderProfile();
  const photoUrl = sender && sender.photoFile && siteUrl
    ? `${siteUrl}/${sender.photoFile.replace(/^\//, "")}`
    : "";

  const sectionHead = (letter: string, title: string) =>
    `<tr><td style="padding:32px 0 8px">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #C45C2E;padding-top:0">
        <tr>
          <td style="padding-top:14px;width:28px;vertical-align:middle;font-size:18px;font-weight:700;color:#C45C2E;white-space:nowrap">${letter}</td>
          <td style="padding-top:14px;vertical-align:middle;font-size:16px;font-weight:700;color:#1a1a1a;padding-left:8px">${e(title)}</td>
        </tr>
      </table>
    </td></tr>`;

  const field = (label: string, value: string) =>
    `<tr><td style="padding:6px 0">
      <p style="margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#888">${e(label)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;line-height:1.6">${e(value)}</p>
    </td></tr>`;

  const divider = () =>
    `<tr><td style="padding:8px 0"><hr style="border:none;border-top:1px solid #e5e5e5;margin:0"></td></tr>`;

  const causeRows = g.rootCauseAnalysis.rankedCauses
    .map(
      (c) =>
        `<tr>
          <td style="padding:8px 12px;font-size:13px;font-weight:700;color:#C45C2E;border-right:1px solid #e5e5e5">#${c.rank}</td>
          <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#1a1a1a">${e(c.factor)}</td>
          <td style="padding:8px 12px;font-size:13px;color:#555;line-height:1.5">${e(c.finding)}</td>
        </tr>`
    )
    .join("");

  const alertRows = [...g.alertRules]
    .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1))
    .map((r) => {
      const color = r.severity === "critical" ? "#CC0000" : "#CC6600";
      return `<tr>
        <td style="padding:6px 12px;font-size:12px;font-weight:700;text-transform:uppercase;color:${color}">${e(r.severity)}</td>
        <td style="padding:6px 12px;font-size:13px;color:#555">${e(r.trigger)}</td>
        <td style="padding:6px 12px;font-size:13px;color:#1a1a1a">${e(r.action)}</td>
      </tr>`;
    })
    .join("");

  const sopBullets = g.workflowSOP.bullets
    .map((b) => `<li style="margin:4px 0;font-size:13px;color:#333;line-height:1.6">${e(b)}</li>`)
    .join("");

  const ownerActions =
    g.ownerBrief?.actions
      ?.map(
        (a) =>
          `<tr>
          <td style="padding:6px 12px;font-size:12px;font-weight:700;text-transform:uppercase;color:#C45C2E;white-space:nowrap">${e(a.when)}</td>
          <td style="padding:6px 12px;font-size:13px;color:#1a1a1a;line-height:1.5">${e(a.action)}</td>
          <td style="padding:6px 12px;font-size:13px;color:#555">${e(a.expectedLift)}</td>
        </tr>`
      )
      .join("") ?? "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DMAIC Report — ${e(brief.workflowName)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:32px 0">
    <tr><td align="center">
      <table width="680" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;max-width:680px;width:100%">

        <!-- Header accent bar -->
        <tr><td style="height:4px;background:#C45C2E"></td></tr>

        <!-- Title block -->
        <tr><td style="padding:32px 40px 24px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#C45C2E">DMAIC Process Analysis</p>
          <h1 style="margin:0 0 4px;font-size:28px;font-weight:700;color:#1a1a1a;line-height:1.2">${e(brief.workflowName || "Process Analysis")}</h1>
          <p style="margin:0;font-size:15px;color:#666">${e(brief.businessName || "")}${brief.businessName ? " · " : ""}${e(date)}</p>
        </td></tr>

        <!-- Executive summary -->
        <tr><td style="padding:0 40px">
          <div style="background:#fff8f5;border:1px solid #f0d5c8;border-radius:6px;padding:20px 24px">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#C45C2E">Executive Summary</p>
            <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.4">${e(g.executiveSummary.headlineFinding)}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;vertical-align:top;width:50%">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;color:#888">Primary Cause</p>
                  <p style="margin:0;font-size:13px;color:#333;line-height:1.5">${e(g.executiveSummary.primaryCause)}</p>
                </td>
                <td style="padding-left:12px;vertical-align:top;border-left:1px solid #e5e5e5">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;color:#888">Recommended First Action</p>
                  <p style="margin:0;font-size:13px;color:#333;line-height:1.5">${e(g.executiveSummary.recommendedAction)}</p>
                </td>
              </tr>
            </table>
            <p style="margin:12px 0 0;font-size:13px;color:#555;line-height:1.5"><strong>Why it matters:</strong> ${e(g.executiveSummary.whyItMatters)}</p>
          </div>
        </td></tr>

        <!-- Body sections -->
        <tr><td style="padding:0 40px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">

            ${sectionHead("D", "Define — Problem Statement")}
            ${field("Business problem", g.problemDefinition.businessProblem)}
            ${field("Affected group", g.problemDefinition.affectedGroup)}
            ${field("Success metric", g.problemDefinition.successMetric)}
            ${field("Scope", g.problemDefinition.scope)}

            ${sectionHead("M", "Measure — Current State")}
            ${
              g.measureBaseline
                ? g.measureBaseline.currentStateMetrics
                    .map((m) => `<tr><td style="padding:3px 0 3px 12px;font-size:13px;color:#333;line-height:1.5;border-left:3px solid #C45C2E">${e(m)}</td></tr>`)
                    .join("") +
                  field("Performance gap", g.measureBaseline.performanceGap) +
                  field("Industry context", g.measureBaseline.industryContext) +
                  field("Priority metric", g.measureBaseline.priorityMetric)
                : ""
            }

            ${sectionHead("A", "Analyze — Root Causes")}
            ${field("Top leakage point", g.rootCauseAnalysis.topLeakagePoint)}
            <tr><td style="padding:12px 0 4px">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;border-collapse:collapse">
                <tr style="background:#f9f9f7">
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e5e5">#</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e5e5">Factor</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e5e5">Finding</th>
                </tr>
                ${causeRows}
              </table>
            </td></tr>
            ${field("Segment insight", g.rootCauseAnalysis.segmentInsight)}

            ${sectionHead("I", "Improve — Recommendation")}
            ${field("First action", g.recommendation.firstAction)}
            ${field("Why this first", g.recommendation.whyThisFirst)}
            ${field("Expected effect", g.recommendation.expectedEffect)}
            ${field("Owner", g.recommendation.owner)}
            ${divider()}
            <tr><td style="padding:12px 0 4px">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;color:#888">Standard Operating Procedure</p>
              <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1a1a1a">${e(g.workflowSOP.title)}</p>
              <p style="margin:0 0 8px;font-size:13px;color:#555">${e(g.workflowSOP.objective)}</p>
              <ul style="margin:0;padding-left:20px">${sopBullets}</ul>
            </td></tr>
            ${field("Escalation", g.workflowSOP.escalation)}
            ${field("SOP owner", g.workflowSOP.owner)}

            ${
              ownerActions
                ? sectionHead("→", "Owner Brief — Prioritized Actions") +
                  `<tr><td style="padding:8px 0">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;border-collapse:collapse">
                      <tr style="background:#f9f9f7">
                        <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e5e5">When</th>
                        <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e5e5">Action</th>
                        <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e5e5">Expected lift</th>
                      </tr>
                      ${ownerActions}
                    </table>
                  </td></tr>` +
                  (g.ownerBrief?.nextDecision
                    ? field("Next decision", g.ownerBrief.nextDecision)
                    : "")
                : ""
            }

            ${sectionHead("C", "Control — Monitoring & Alerts")}
            ${field("What's fixed", g.monitoringReport.fix)}
            ${field("Metrics to track", g.monitoringReport.metrics)}
            ${field("Alert thresholds", g.monitoringReport.thresholds)}
            ${field("Owner", g.monitoringReport.owner)}
            ${field("If metrics drift", g.monitoringReport.responsePlan)}
            <tr><td style="padding:12px 0 4px">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:6px;overflow:hidden;border-collapse:collapse">
                <tr style="background:#f9f9f7">
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e5e5">Severity</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e5e5">Trigger</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e5e5">Action</th>
                </tr>
                ${alertRows}
              </table>
            </td></tr>

          </table>
        </td></tr>

        <!-- Personal note from sender (only rendered when SENDER_NAME and SENDER_EMAIL are set) -->
        ${sender ? `<tr><td style="padding:36px 40px 8px">
          <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#C45C2E">${e(sender.noteIntro)}</p>
          ${sender.noteBody ? `<p style="margin:0 0 22px;font-size:14px;color:#333;line-height:1.65">${e(sender.noteBody)}</p>` : ""}
          <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
            <tr>
              ${photoUrl ? `<td style="vertical-align:top;padding-right:20px;width:84px">
                <img src="${e(photoUrl)}" alt="${e(sender.name)}" width="72" height="72" style="display:block;width:72px;height:72px;border-radius:50%;border:2px solid #f0d5c8;object-fit:cover" />
              </td>` : ""}
              <td style="vertical-align:top">
                <p style="margin:0;font-size:15px;font-weight:700;color:#1a1a1a;font-style:italic;font-family:Georgia,'Times New Roman',serif">${e(sender.name)}${sender.credentials ? `<span style="font-style:normal;font-weight:400;font-size:11px;color:#888;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;letter-spacing:.04em">&nbsp;&nbsp;${e(sender.credentials)}</span>` : ""}</p>
                ${sender.title ? `<p style="margin:3px 0 2px;font-size:12px;color:#666;letter-spacing:.01em">${e(sender.title)}</p>` : ""}
                ${sender.tagline ? `<p style="margin:0 0 12px;font-size:11px;color:#999;letter-spacing:.01em">${e(sender.tagline)}</p>` : ""}
                <p style="margin:0;font-size:12px;color:#666;line-height:1.6">
                  <a href="mailto:${e(sender.email)}" style="color:#C45C2E;text-decoration:none">${e(sender.email)}</a>
                  ${sender.website ? `<span style="color:#ccc;padding:0 6px">&middot;</span>
                  <a href="${e(sender.website)}" style="color:#C45C2E;text-decoration:none">${e(sender.websiteLabel || sender.website.replace(/^https?:\/\//, ""))}</a>` : ""}
                  ${sender.linkedin ? `<span style="color:#ccc;padding:0 6px">&middot;</span>
                  <a href="${e(sender.linkedin)}" style="color:#C45C2E;text-decoration:none">LinkedIn</a>` : ""}
                </p>
              </td>
            </tr>
          </table>
        </td></tr>` : ""}

        <!-- Attribution -->
        <tr><td style="padding:24px 40px 24px;border-top:1px solid #e5e5e5;background:#f9f9f7">
          <p style="margin:0;font-size:11px;color:#aaa;letter-spacing:.04em">Generated by Operator Agent &middot; Claude Opus 4.7 &middot; ${e(date)}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = (process.env.RESEND_API_KEY ?? "").trim();
  if (!apiKey || apiKey === "your_resend_key_here") {
    return Response.json(
      { error: "RESEND_API_KEY is not configured. Add it to .env.local." },
      { status: 500 }
    );
  }

  let body: { email?: unknown; brief?: unknown; generated?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const brief = body.brief as IntakeBrief | null;
  const generated = body.generated as GeneratedOutputPayload | null;
  if (!brief || !generated) {
    return Response.json({ error: "Missing brief or generated payload." }, { status: 400 });
  }

  const html = buildEmailHtml(brief, generated);
  const subject = `Your DMAIC analysis — ${brief.workflowName || "Process analysis"}${brief.businessName ? ` (${brief.businessName})` : ""}`;

  const resend = new Resend(apiKey);
  const audienceId = (process.env.RESEND_AUDIENCE_ID ?? "").trim();
  const ownerEmail = (process.env.OWNER_EMAIL ?? "").trim();
  const fromAddress =
    (process.env.RESEND_FROM_EMAIL ?? "").trim() ||
    "Operator Agent <onboarding@resend.dev>";

  // Send the report. Replies route to OWNER_EMAIL since the From address is no-reply.
  const { error } = await resend.emails.send({
    from: fromAddress,
    to: [email],
    replyTo: ownerEmail || undefined,
    subject,
    html,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Add to Resend Audience contact list (if configured)
  if (audienceId) {
    try {
      await resend.contacts.create({ email, audienceId, unsubscribed: false });
    } catch {
      // Non-fatal
    }
  }

  // Notify owner (if configured)
  if (ownerEmail) {
    try {
      await resend.emails.send({
        from: fromAddress,
        to: [ownerEmail],
        subject: `Report requested: ${brief.workflowName || "process"} — ${email}`,
        html: `<p style="font-family:sans-serif;font-size:14px;color:#333">
          <strong>${email}</strong> just requested their DMAIC report.<br><br>
          <strong>Workflow:</strong> ${brief.workflowName || "(unnamed)"}<br>
          <strong>Business:</strong> ${brief.businessName || "(unnamed)"}<br>
          Time: ${new Date().toUTCString()}
        </p>`,
      });
    } catch {
      // Non-fatal
    }
  }

  return Response.json({ ok: true });
}
