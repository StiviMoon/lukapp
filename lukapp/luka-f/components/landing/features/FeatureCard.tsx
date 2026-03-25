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
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.28,
        delay: index * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "h-full flex flex-col rounded-2xl border bg-bg-card card-elevated",
        "border-[#E0DFF0] dark:border-white/[0.07]",
        "p-5 sm:p-6 transition-all duration-200",
        "hover:border-purple-brand/20 hover:-translate-y-0.5",
        "dark:hover:border-white/15",
        "focus-within:ring-2 focus-within:ring-lime/30 focus-within:border-lime/30",
        "outline-none"
      )}
    >
      {/* Header: icon + number — fixed height, symmetric */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div
          className={cn(
            "flex shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl items-center justify-center border",
            accent === "lime"
              ? "bg-lime/10 border-lime/20"
              : "bg-purple-bright/10 border-purple-bright/20"
          )}
        >
          <Icon
            size={22}
            className={accent === "lime" ? "text-lime" : "text-purple-muted"}
            strokeWidth={1.75}
          />
        </div>
        <span
          className="font-nums text-[10px] sm:text-[11px] font-bold text-fg/[0.15] tracking-[0.2em] tabular-nums"
          aria-hidden
        >
          {number}
        </span>
      </div>

      {/* Content — flex-1 so all cards in a row share equal height */}
      <div className="flex flex-col flex-1 min-h-0">
        <p
          className="text-[10px] sm:text-[11px] font-semibold text-fg/35 uppercase tracking-wider mb-1.5"
          aria-hidden
        >
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
