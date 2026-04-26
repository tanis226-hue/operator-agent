import type { ReactNode } from "react";

export function SectionHead({
  eyebrow,
  marker,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  marker?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
      <div>
        {eyebrow && (
          <div className="eyebrow eyebrow-accent mb-2">
            {marker && (
              <span className="mr-2" style={{ color: "var(--ink-3)" }}>
                {marker}
              </span>
            )}
            {eyebrow}
          </div>
        )}
        <h3 className="h-card" style={{ margin: 0, fontSize: 26 }}>
          {title}
        </h3>
        {sub && (
          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)", maxWidth: 560 }}>
            {sub}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
