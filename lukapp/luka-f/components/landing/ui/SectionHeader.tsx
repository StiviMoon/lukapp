import { ReactNode } from "react";

interface SectionHeaderProps {
  badge: string;
  title: ReactNode;
  subtitle?: string;
  titleId?: string;
}

export default function SectionHeader({ badge, title, subtitle, titleId }: SectionHeaderProps) {
  return (
    <div className="text-center mb-12 sm:mb-16">
      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-soft border border-accent-border rounded-full text-accent-text dark:text-accent text-[12px] font-bold mb-5 tracking-wide">
        {badge}
      </span>
      <h2
        id={titleId}
        className="font-display font-extrabold tracking-tight text-foreground leading-[1.1] mb-4"
        style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-[16px] max-w-[420px] mx-auto text-foreground/70 dark:text-foreground/65 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
