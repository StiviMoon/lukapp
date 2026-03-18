"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Users, Plus, ChevronRight } from "lucide-react";
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FriendsPage() {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [creatingSpaceFor, setCreatingSpaceFor] = useState<string | null>(null);

  const { data: contacts = [], isLoading: contactsRaw } = useContacts();
  const isLoading = useMinDelay(contactsRaw);
  const { data: spaces = [] } = useMySpaces();
  const { mutateAsync: createSpace, isPending: creatingSpace } = useCreateSpace();

  const pending = contacts.filter((c) => c.status === "PENDING");
  const accepted = contacts.filter((c) => c.status === "ACCEPTED");

  // Build map: otherUserId → spaceId
  const spaceByOtherUser = new Map<string, string>();
  spaces.forEach((s) => {
    s.members.forEach((m) => {
      if (m.userId !== s.createdBy) {
        spaceByOtherUser.set(m.userId, s.id);
      }
      if (m.userId === s.createdBy) {
        // also check other member
      }
    });
    if (s.members.length === 2) {
      const [a, b] = s.members;
      spaceByOtherUser.set(a.userId, s.id);
      spaceByOtherUser.set(b.userId, s.id);
    }
  });

  const handleCreateSpace = async (contactId: string) => {
    setCreatingSpaceFor(contactId);
    const res = await createSpace({ contactId });
    setCreatingSpaceFor(null);
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
          <div className="w-9" />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-36 pt-2 flex flex-col gap-4">
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
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[68px] rounded-2xl bg-card animate-pulse" />
                ))}
              </div>
            ) : accepted.length > 0 ? (
              <div className="flex flex-col gap-2">
                {accepted.map((c) => {
                  const spaceId = spaceByOtherUser.get(c.other.userId) ?? null;
                  return (
                    <ContactItem
                      key={c.id}
                      contact={c}
                      spaceId={spaceId}
                      onCreateSpace={handleCreateSpace}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setInviteOpen(true)}
        className="fixed bottom-24 right-5 flex items-center gap-2 px-5 h-14 rounded-full bg-primary shadow-lg active:scale-95 transition-transform z-40"
        style={{ boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 40%, transparent)" }}
      >
        <Plus className="w-5 h-5 text-white" strokeWidth={2.4} />
        <span className="text-white text-sm font-bold">Invitar</span>
      </button>

      <InviteSheet isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
