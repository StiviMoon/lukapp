"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionHeaderProps {
  badge: string;
  title: ReactNode;
  subtitle?: string;
  titleId?: string;
}

export default function SectionHeader({ badge, title, subtitle, titleId }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="text-center mb-12 sm:mb-16"
    >
      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-soft border border-accent-border rounded-full text-accent text-[12px] font-semibold mb-5">
        {badge}
      </span>
      <h2
        id={titleId}
        className="font-display font-extrabold tracking-tight text-fg leading-[1.1] mb-4"
        style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-fg/40 text-[16px] max-w-[400px] mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
}
