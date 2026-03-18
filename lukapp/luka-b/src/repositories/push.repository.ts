import { prisma } from "@/db/client";

export class PushRepository {
  async save(userId: string, sub: { endpoint: string; p256dh: string; auth: string }) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: { userId, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      update: { userId, p256dh: sub.p256dh, auth: sub.auth },
    });
  }

  async findByUserId(userId: string) {
    return prisma.pushSubscription.findMany({ where: { userId } });
  }

  async deleteByEndpoint(endpoint: string) {
    await prisma.pushSubscription.delete({ where: { endpoint } }).catch(() => {});
  }
}

export const pushRepository = new PushRepository();
