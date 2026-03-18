import webpushLib from "web-push";
import { pushRepository } from "@/repositories/push.repository";
import { spaceRepository } from "@/repositories/space.repository";

// Initialize VAPID if keys are configured
let webpushReady = false;

function getWebPush(): typeof webpushLib | null {
  if (!webpushReady && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpushLib.setVapidDetails(
      process.env.VAPID_EMAIL ?? "mailto:hello@lukapp.co",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    webpushReady = true;
  }
  return webpushReady ? webpushLib : null;
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(amount);
}

export class PushService {
  async subscribe(userId: string, subscription: { endpoint: string; p256dh: string; auth: string }) {
    return pushRepository.save(userId, subscription);
  }

  async unsubscribe(endpoint: string) {
    await pushRepository.deleteByEndpoint(endpoint);
  }

  getVapidPublicKey(): string | null {
    return process.env.VAPID_PUBLIC_KEY ?? null;
  }

  async sendToUser(userId: string, payload: { title: string; body: string; url?: string }) {
    const wp = getWebPush();
    if (!wp) return; // Push not configured

    const subs = await pushRepository.findByUserId(userId);
    await Promise.allSettled(
      subs.map(sub =>
        wp.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        ).catch(async (err: any) => {
          if (err?.statusCode === 410) {
            await pushRepository.deleteByEndpoint(sub.endpoint);
          }
        })
      )
    );
  }

  async notifyNewTransaction(spaceId: string, authorId: string, amount: number, description?: string | null) {
    const space = await spaceRepository.findSpaceById(spaceId);
    if (!space) return;

    const otherMembers = space.members.filter(m => m.userId !== authorId);
    await Promise.allSettled(
      otherMembers.map(m =>
        this.sendToUser(m.userId, {
          title: "Nuevo gasto registrado",
          body: description ? `${formatCOP(amount)} — ${description}` : `${formatCOP(amount)} registrado`,
          url: `/shared/${spaceId}`,
        })
      )
    );
  }

  async notifyDeletionRequest(spaceId: string, requesterId: string) {
    const space = await spaceRepository.findSpaceById(spaceId);
    if (!space) return;

    const otherMembers = space.members.filter(m => m.userId !== requesterId);
    await Promise.allSettled(
      otherMembers.map(m =>
        this.sendToUser(m.userId, {
          title: "Solicitud de eliminar sala",
          body: "Un miembro quiere eliminar la sala compartida",
          url: `/shared/${spaceId}`,
        })
      )
    );
  }

  async notifyContactInvite(receiverId: string, senderName: string) {
    await this.sendToUser(receiverId, {
      title: "Nueva invitación de contacto",
      body: `${senderName} te envió una invitación`,
      url: "/friends",
    });
  }
}

export const pushService = new PushService();
