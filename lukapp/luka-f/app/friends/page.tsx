"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Users, Plus, ChevronRight, Check } from "lucide-react";
import { useContacts, useAcceptContact, useRemoveContact } from "@/lib/hooks/use-contacts";
import { useMinDelay } from "@/lib/hooks/use-min-delay";
import { useMySpaces, useCreateSpace } from "@/lib/hooks/use-spaces";
import { InviteSheet } from "@/components/shared/InviteSheet";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Contact } from "@/lib/types/shared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

function Avatar({ name, avatarUrl }: { name: string | null; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? ""}
        className="w-10 h-10 rounded-2xl object-cover shrink-0"
      />
    );
  }
  const letter = (name ?? "?").charAt(0).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-primary">{letter}</span>
    </div>
  );
}

// ─── Pending invite item ──────────────────────────────────────────────────────

function PendingItem({ contact }: { contact: Contact }) {
  const { mutateAsync: accept, isPending: accepting } = useAcceptContact();
  const { mutateAsync: remove, isPending: rejecting } = useRemoveContact();

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card">
      <Avatar name={contact.other.fullName} avatarUrl={contact.other.avatarUrl} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">
          {contact.other.fullName ?? contact.other.email}
        </p>
        <p className="text-[11px] text-muted-foreground/60">{timeAgo(contact.createdAt)}</p>
      </div>
      {!contact.isSender && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={async () => {
              const res = await remove(contact.id);
              if (!res.success) toast.error(res.error?.message ?? "Error");
            }}
            disabled={rejecting}
            className="px-3 py-1.5 rounded-xl bg-muted/60 text-[12px] font-semibold text-muted-foreground disabled:opacity-40"
          >
            Rechazar
          </button>
          <button
            onClick={async () => {
              const res = await accept(contact.id);
              if (!res.success) toast.error(res.error?.message ?? "Error");
              else toast.success("Contacto aceptado");
            }}
            disabled={accepting}
            className="px-3 py-1.5 rounded-xl bg-primary text-white text-[12px] font-semibold disabled:opacity-40"
          >
            Aceptar
          </button>
        </div>
      )}
      {contact.isSender && (
        <span className="text-[11px] text-muted-foreground/50 bg-muted/40 px-2.5 py-1 rounded-lg">
          Pendiente
        </span>
      )}
    </div>
  );
}

// ─── Accepted contact item ────────────────────────────────────────────────────

function ContactItem({
  contact,
  onCreateSpace,
  spaceId,
}: {
  contact: Contact;
  onCreateSpace: (contactId: string) => void;
  spaceId: string | null;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card">
      <Avatar name={contact.other.fullName} avatarUrl={contact.other.avatarUrl} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">
          {contact.other.fullName ?? contact.other.email}
        </p>
        <p className="text-[11px] text-muted-foreground/60 truncate">{contact.other.email}</p>
      </div>
      {spaceId ? (
        <button
          onClick={() => router.push(`/shared/${spaceId}`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/50 text-[12px] font-semibold text-muted-foreground hover:bg-muted transition-colors shrink-0"
        >
          Ver sala
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          onClick={() => onCreateSpace(contact.id)}
          className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors shrink-0"
        >
          Crear sala
        </button>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FriendsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-28 rounded bg-muted-foreground/10 animate-pulse ml-1" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[68px] rounded-2xl bg-muted-foreground/10 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-card">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3.5 bg-background">
        <Users className="w-5 h-5 text-muted-foreground/25" />
      </div>
      <p className="text-sm font-semibold text-muted-foreground/40 mb-1">Sin contactos aún</p>
      <p className="text-xs text-muted-foreground/25">Invita a tu pareja o familiar</p>
    </div>
  );
}

// ─── Space type + familiar select sheet ──────────────────────────────────────

function CreateSpaceSheet({
  initialContactId,
  acceptedContacts,
  onClose,
  onCreate,
  isCreating,
}: {
  initialContactId: string;
  acceptedContacts: Contact[];
  onClose: () => void;
  onCreate: (contactIds: string[], type: "PAREJA" | "FAMILIAR") => Promise<void>;
  isCreating: boolean;
}) {
  const [step, setStep] = useState<"type" | "familiar">("type");
  const [selected, setSelected] = useState<Set<string>>(new Set([initialContactId]));

  const others = acceptedContacts.filter(c => c.id !== initialContactId);

  const toggleContact = (id: string) => {
    if (id === initialContactId) return; // initial contact is locked
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePareja = () => onCreate([initialContactId], "PAREJA");
  const handleFamiliar = () => {
    if (others.length === 0) {
      // No other contacts — create familiar with just this one
      onCreate([initialContactId], "FAMILIAR");
    } else {
      setStep("familiar");
    }
  };
  const handleConfirmFamiliar = () => onCreate(Array.from(selected), "FAMILIAR");

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 z-60"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-60 bg-card rounded-t-3xl px-5 pt-4 pb-10 max-w-sm mx-auto"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />

        {step === "type" ? (
          <>
            <h3 className="text-[15px] font-bold text-foreground mb-1">¿Qué tipo de sala?</h3>
            <p className="text-[12px] text-muted-foreground/60 mb-5">
              Elige cómo quieres organizar los gastos
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePareja}
                disabled={isCreating}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-muted/50 hover:bg-muted/80 transition-colors text-left active:scale-[0.98] disabled:opacity-40"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 flex items-center justify-center shrink-0 text-lg">
                  ❤️
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground">Pareja</p>
                  <p className="text-[12px] text-muted-foreground/60">Solo 2 personas</p>
                </div>
              </button>
              <button
                onClick={handleFamiliar}
                disabled={isCreating}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-muted/50 hover:bg-muted/80 transition-colors text-left active:scale-[0.98] disabled:opacity-40"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 text-lg">
                  👨‍👩‍👧
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground">Familiar</p>
                  <p className="text-[12px] text-muted-foreground/60">2 o más personas</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Selecciona miembros</h3>
            <p className="text-[12px] text-muted-foreground/60 mb-4">
              El contacto inicial ya está incluido
            </p>
            <div className="flex flex-col gap-2 mb-5 max-h-64 overflow-y-auto">
              {acceptedContacts.map(c => {
                const isInitial = c.id === initialContactId;
                const isChecked = selected.has(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleContact(c.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors text-left",
                      isChecked ? "bg-primary/10" : "bg-muted/40"
                    )}
                    disabled={isInitial}
                  >
                    <Avatar name={c.other.fullName} avatarUrl={c.other.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">
                        {c.other.fullName ?? c.other.email}
                      </p>
                      {isInitial && (
                        <p className="text-[10px] text-muted-foreground/50">Incluido</p>
                      )}
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      isChecked ? "bg-primary border-primary" : "border-muted-foreground/30"
                    )}>
                      {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleConfirmFamiliar}
              disabled={isCreating || selected.size < 1}
              className="w-full py-3.5 rounded-2xl bg-primary text-white text-[14px] font-bold disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              {isCreating ? "Creando..." : `Crear sala familiar (${selected.size + 1} miembros)`}
            </button>
          </>
        )}
      </motion.div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FriendsPage() {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [typeSheetFor, setTypeSheetFor] = useState<string | null>(null);

  const { data: contacts = [], isLoading: contactsRaw } = useContacts();
  const isLoading = useMinDelay(contactsRaw);
  const { data: spaces = [] } = useMySpaces();
  const { mutateAsync: createSpace, isPending: creatingSpace } = useCreateSpace();

  const pending = contacts.filter((c) => c.status === "PENDING");
  const accepted = contacts.filter((c) => c.status === "ACCEPTED");

  // Build map: otherUserId → spaceId
  const spaceByOtherUser = new Map<string, string>();
  spaces.forEach((s) => {
    if (s.members.length === 2) {
      const [a, b] = s.members;
      spaceByOtherUser.set(a.userId, s.id);
      spaceByOtherUser.set(b.userId, s.id);
    }
  });

  const handleCreateSpace = async (contactIds: string[], type: "PAREJA" | "FAMILIAR") => {
    const res = await createSpace({ contactIds, type });
    setTypeSheetFor(null);
    if (!res.success) {
      toast.error(res.error?.message ?? "Error al crear sala");
      return;
    }
    toast.success("Sala compartida creada");
    const space = res.data as { id: string } | undefined;
    if (space?.id) router.push(`/shared/${space.id}`);
  };

  return (
    <>
      <div className="h-dvh flex flex-col bg-background overflow-hidden max-w-sm mx-auto">
        {/* Header */}
        <header className="flex-none px-5 pt-12 pb-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card hover:bg-muted/60 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground font-display">Amigos</h1>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary active:scale-95 transition-transform"
            aria-label="Agregar amigo"
          >
            <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-app-scroll flex flex-col gap-4">
          {isLoading ? (
            <FriendsSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              {/* Pendientes */}
              <AnimatePresence>
                {pending.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
                      Invitaciones pendientes
                    </p>
                    <div className="flex flex-col gap-2">
                      {pending.map((c) => (
                        <PendingItem key={c.id} contact={c} />
                      ))}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Aceptados */}
              <section>
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
                  Mis contactos
                </p>
                {accepted.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {accepted.map((c) => {
                      const spaceId = spaceByOtherUser.get(c.other.userId) ?? null;
                      return (
                        <ContactItem
                          key={c.id}
                          contact={c}
                          spaceId={spaceId}
                          onCreateSpace={(contactId) => setTypeSheetFor(contactId)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </section>
            </motion.div>
          )}
        </div>
      </div>


      {/* Space type + member selection sheet */}
      <AnimatePresence>
        {typeSheetFor && (
          <CreateSpaceSheet
            initialContactId={typeSheetFor}
            acceptedContacts={accepted}
            onClose={() => setTypeSheetFor(null)}
            onCreate={handleCreateSpace}
            isCreating={creatingSpace}
          />
        )}
      </AnimatePresence>

      <InviteSheet isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
