"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, CheckCheck, X } from "lucide-react";

interface SuccessModalProps {
  referralCode: string;
  onClose: () => void;
}

export default function SuccessModal({ referralCode, onClose }: SuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const link = `https://lukapp.co/ref/${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // fallback silent
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#111] border border-white/[0.09] rounded-t-3xl md:rounded-3xl p-8 w-full max-w-md text-center relative"
        >
          {/* Handle (mobile) */}
          <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-7 md:hidden" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={14} className="text-fg/50" strokeWidth={2.5} />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-lime/10 border border-lime/25 flex items-center justify-center mx-auto mb-5">
            <Check size={24} className="text-lime" strokeWidth={2.5} />
          </div>

          <h3 className="font-display font-bold text-[24px] tracking-tight text-fg mb-2.5">
            ¡Ya estás dentro!
          </h3>
          <p className="text-[15px] text-fg/40 leading-[1.65] mb-7">
            Te avisaremos cuando abra el acceso. Comparte y gana <strong className="text-fg/60">1 mes premium gratis</strong> por cada 3 amigos que se unan.
          </p>

          {/* Referral box */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 text-[13px] text-fg/30 overflow-hidden text-ellipsis whitespace-nowrap text-left">
              {link}
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-3 bg-lime text-bg font-bold text-[13px] rounded-xl hover:bg-lime-dark transition-colors duration-200 flex-shrink-0"
            >
              {copied
                ? <><CheckCheck size={14} strokeWidth={2.5} /> Copiado</>
                : <><Copy size={14} strokeWidth={2.5} /> Copiar</>
              }
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl border border-white/[0.09] text-fg/50 font-medium text-[14px] hover:border-white/15 hover:text-fg/70 transition-all duration-300"
          >
            Cerrar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
