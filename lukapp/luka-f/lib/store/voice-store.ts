import { create } from "zustand";

export type VoicePhase =
  | "idle"
  | "listening"
  | "processing"
  | "confirming"
  | "saving"
  | "done"
  | "error";

export interface ParsedTransaction {
  type: "INCOME" | "EXPENSE";
  amount: number;
  suggestedCategoryName: string;
  categoryId: string | null;
  description: string;
  confidence: "high" | "medium" | "low";
  rawTranscript: string;
}

interface VoiceState {
  phase: VoicePhase;
  isOpen: boolean;
  transcript: string;
  interimTranscript: string;
  parsedTx: ParsedTransaction | null;
  errorMessage: string | null;

  openVoice: () => void;
  closeVoice: () => void;
  setTranscript: (text: string) => void;
  setInterim: (text: string) => void;
  setPhase: (phase: VoicePhase) => void;
  setParsedTx: (tx: ParsedTransaction) => void;
  setError: (msg: string) => void;
  reset: () => void;
}

const initialState = {
  phase: "idle" as VoicePhase,
  isOpen: false,
  transcript: "",
  interimTranscript: "",
  parsedTx: null,
  errorMessage: null,
};

export const useVoiceStore = create<VoiceState>((set, get) => ({
  ...initialState,

  openVoice: () => set({ isOpen: true, phase: "listening" }),

  closeVoice: () => {
    get().reset();
    // Delay para que la animación de salida complete
    setTimeout(() => set({ isOpen: false }), 300);
  },

  setTranscript: (text) => set({ transcript: text, interimTranscript: "" }),
  setInterim: (text) => set({ interimTranscript: text }),
  setPhase: (phase) => set({ phase }),
  setParsedTx: (tx) => set({ parsedTx: tx }),
  setError: (msg) => set({ errorMessage: msg }),

  reset: () =>
    set({
      phase: "idle",
      transcript: "",
      interimTranscript: "",
      parsedTx: null,
      errorMessage: null,
    }),
}));
