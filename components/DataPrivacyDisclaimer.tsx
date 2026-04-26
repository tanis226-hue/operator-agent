"use client";

export function DataPrivacyDisclaimer() {
  return (
    <p className="text-[11px] text-ink-muted leading-relaxed">
      <strong>Privacy notice:</strong> We don't store your data. Files and database connections are used only during your analysis session and completely removed afterwards. Database credentials are never saved.{" "}
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:text-accent-hover underline"
      >
        Full privacy policy →
      </a>
    </p>
  );
}
