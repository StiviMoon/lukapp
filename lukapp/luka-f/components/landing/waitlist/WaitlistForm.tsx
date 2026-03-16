"use client";

import { useForm, ValidationError } from "@formspree/react";
import { Loader2, ArrowRight } from "lucide-react";
const FORMSPREE_ID = "xyknnybd";

const inputClass =
  "w-full bg-fg/[0.04] dark:bg-white/[0.04] border border-border rounded-2xl px-5 py-4 text-[15px] text-fg placeholder:text-fg/30 outline-none transition-all duration-200 disabled:opacity-50 focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function WaitlistForm() {
  const [state, handleSubmit] = useForm(FORMSPREE_ID);

  if (state.succeeded) {
    return (
      <div className="rounded-2xl border border-accent-border bg-accent-soft p-6 text-center">
        <p className="text-accent font-semibold">¡Listo! Te avisaremos cuando lukapp esté disponible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Tu nombre"
          autoComplete="name"
          disabled={state.submitting}
          className={inputClass}
          required
        />
        <ValidationError prefix="Nombre" field="name" errors={state.errors} className="mt-2 text-[12px] text-pink-400 pl-1 block" />
      </div>

      <div>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="tu@email.com"
          autoComplete="email"
          disabled={state.submitting}
          className={inputClass}
          required
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-2 text-[12px] text-pink-400 pl-1 block" />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="flex items-center justify-center gap-2.5 w-full py-4 bg-lime text-bg font-bold text-[15px] rounded-2xl hover:bg-lime-dark transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state.submitting ? (
          <>
            <Loader2 size={17} strokeWidth={2.5} className="animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            Unirme a la lista
            <ArrowRight size={17} strokeWidth={2.5} />
          </>
        )}
      </button>

      <p className="text-center text-[12px] text-fg/40">
        Solo te avisamos cuando esté listo. Sin spam.
      </p>
    </form>
  );
}
