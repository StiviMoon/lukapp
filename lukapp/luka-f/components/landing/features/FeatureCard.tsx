"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  number: string;
  label: string;
  title: string;
  description: string;
  accent: "lime" | "purple";
  index: number;
}

export default function FeatureCard({
  icon: Icon,
  number,
  label,
  title,
  description,
  accent,
  index,
}: FeatureCardProps) {
  const isLime = accent === "lime";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group h-full flex flex-col rounded-2xl border bg-bg-card",
        "border-fg/[0.07] dark:border-white/[0.07]",
        "p-5 sm:p-6 transition-all duration-300 relative overflow-hidden",
        "hover:-translate-y-1",
        isLime
          ? "hover:border-[#baea0f]/30 dark:hover:border-[#baea0f]/20"
          : "hover:border-[#5913ef]/30 dark:hover:border-[#7a3ff5]/25",
      )}
    >
      {/* Hover glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl",
          isLime
            ? "bg-[radial-gradient(ellipse_at_top_left,rgba(186,234,15,0.06),transparent_60%)]"
            : "bg-[radial-gradient(ellipse_at_top_left,rgba(89,19,239,0.08),transparent_60%)]"
        )}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div
          className={cn(
            "flex shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl items-center justify-center border transition-all duration-300",
            isLime
              ? "bg-[#baea0f]/10 border-[#baea0f]/20 group-hover:bg-[#baea0f]/15 group-hover:border-[#baea0f]/30 group-hover:shadow-[0_4px_14px_rgba(186,234,15,0.15)]"
              : "bg-[#5913ef]/10 border-[#5913ef]/20 group-hover:bg-[#5913ef]/15 group-hover:border-[#5913ef]/30 group-hover:shadow-[0_4px_14px_rgba(89,19,239,0.15)]"
          )}
        >
          <Icon
            size={22}
            className={isLime ? "text-[#baea0f]" : "text-[#a07af8]"}
            strokeWidth={1.75}
          />
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] font-bold text-fg/[0.12] tracking-[0.2em] tabular-nums" aria-hidden>
          {number}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-h-0">
        <p className="text-[10px] sm:text-[11px] font-semibold text-fg/30 uppercase tracking-wider mb-1.5" aria-hidden>
          {label}
        </p>
        <h3 className="font-display font-bold text-base sm:text-[17px] text-fg leading-snug mb-2">
          {title}
        </h3>
        <p className="text-[13px] sm:text-[14px] text-fg/45 leading-[1.65] flex-1">
          {description}
        </p>
      </div>
    </motion.article>
  );
}
