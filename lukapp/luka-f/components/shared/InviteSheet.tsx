"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, CheckCircle2 } from "lucide-react";
import { useInviteContact } from "@/lib/hooks/use-contacts";
import { useKeyboardBottomInset } from "@/lib/hooks/use-keyboard-bottom-inset";
import { useSheetAutofocus } from "@/lib/hooks/use-sheet-autofocus";
import { toast } from "@/lib/toast";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.25, delay: 0.05 } },
};

const sheetVariants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { type: "spring" as const, damping: 28, stiffness: 280 } },
  exit: { y: "100%", transition: { duration: 0.25, ease: "easeIn" as const } },
};

interface InviteSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteSheet({ isOpen, onClose }: InviteSheetProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const keyboardInset = useKeyboardBottomInset(isOpen);
  useSheetAutofocus(isOpen && !sent, emailInputRef);

  const { mutateAsync, isPending } = useInviteContact();

  const handleClose = () => {
    setEmail("");
    setSent(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const res = await mutateAsync(email.trim());
    if (!res.success) {
      toast.error(res.error?.message ?? "Error al enviar invitación");
      return;
    }

    setSent(true);
    toast.success("Invitación enviada");
    setTimeout(handleClose, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 z-60"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 right-0 z-60 bg-card rounded-t-3xl max-w-sm mx-auto flex flex-col max-h-[min(92dvh,calc(100dvh-0.5rem))] shadow-lg outline-none"
            style={{
              paddingBottom: `calc(1.25rem + env(safe-area-inset-bottom, 0px) + ${keyboardInset}px)`,
            }}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="shrink-0 px-5 pt-5">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-5" />

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-foreground">Invitar por email</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5">
              {sent ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <CheckCircle2 className="w-12 h-12 text-lime" />
                  <p className="text-sm font-semibold text-foreground">¡Invitación enviada!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-1">
                  <input
                    ref={emailInputRef}
                    type="email"
                    enterKeyHint="send"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-3 rounded-2xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!email.trim() || isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-white text-sm font-bold disabled:opacity-40 transition-opacity active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" />
                    {isPending ? "Enviando..." : "Enviar invitación"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
