import type { ReactNode } from "react";

type Tone = "default" | "accent" | "alert" | "warn" | "ok";
type Size = "sm" | "md";

const TONE_STYLES: Record<Tone, string> = {
  default: "bg-surface text-ink-muted border-line",
  accent:  "bg-accent-soft text-accent border-accent/30",
  alert:   "bg-rust-soft text-rust-ink border-rust-border",
  warn:    "bg-ochre-soft text-ochre-ink border-ochre-border",
  ok:      "bg-moss-soft text-moss-ink border-moss-border",
};

export function Pill({
  children,
  tone = "default",
  size = "sm",
}: {
  children: ReactNode;
  tone?: Tone;
  size?: Size;
}) {
  return (
    <span
      className={[
        "uppercase-mono inline-flex items-center gap-1.5 rounded-full border",
        size === "sm" ? "px-2 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-[10.5px]",
        TONE_STYLES[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
