import { prisma } from "@/db/client";
import { SpaceRole, SpaceType, Prisma } from "@prisma/client";

const memberProfileSelect = {
  userId: true,
  email: true,
  fullName: true,
  avatarUrl: true,
};

export class SpaceRepository {
  async createSpace(data: { name: string; createdBy: string; memberUserIds: string[]; type: SpaceType }) {
    return prisma.sharedSpace.create({
      data: {
        name: data.name,
        type: data.type,
        createdBy: data.createdBy,
        members: {
          create: [
            { userId: data.createdBy, role: SpaceRole.OWNER },
            ...data.memberUserIds.map(userId => ({ userId, role: SpaceRole.MEMBER })),
          ],
        },
      },
      include: {
        members: { include: { profile: { select: memberProfileSelect } } },
        budgets: true,
      },
    });
  }

  async findSpacesByUser(userId: string) {
    return prisma.sharedSpace.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { profile: { select: memberProfileSelect } } },
        budgets: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findSpaceById(id: string) {
    return prisma.sharedSpace.findUnique({
      where: { id },
      include: {
        members: { include: { profile: { select: memberProfileSelect } } },
        budgets: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  async findSpaceBetweenUsers(userA: string, userB: string) {
    return prisma.sharedSpace.findFirst({
      where: {
        members: { some: { userId: userA } },
        AND: { members: { some: { userId: userB } } },
      },
    });
  }

  async findMember(spaceId: string, userId: string) {
    return prisma.spaceMember.findUnique({
      where: { spaceId_userId: { spaceId, userId } },
    });
  }

  async updateSalary(spaceId: string, userId: string, salary: Prisma.Decimal | number) {
    return prisma.spaceMember.update({
      where: { spaceId_userId: { spaceId, userId } },
      data: { salary },
    });
  }

  async createSharedBudget(spaceId: string, data: { categoryName: string; percentage: number }) {
    return prisma.sharedBudget.create({
      data: { spaceId, categoryName: data.categoryName, percentage: data.percentage },
    });
  }

  async updateSharedBudget(id: string, data: { categoryName?: string; percentage?: number }) {
    return prisma.sharedBudget.update({ where: { id }, data });
  }

  async deleteSharedBudget(id: string) {
    await prisma.sharedBudget.delete({ where: { id } });
  }

  async findBudgetById(id: string) {
    return prisma.sharedBudget.findUnique({ where: { id } });
  }

  async createSharedTransaction(data: {
    spaceId: string;
    authorId: string;
    amount: number;
    sharedBudgetId?: string;
    description?: string;
    date?: Date;
  }) {
    return prisma.sharedTransaction.create({
      data: {
        spaceId: data.spaceId,
        authorId: data.authorId,
        amount: data.amount,
        sharedBudgetId: data.sharedBudgetId ?? null,
        description: data.description ?? null,
        date: data.date ?? new Date(),
      },
      include: { author: { select: memberProfileSelect }, sharedBudget: { select: { categoryName: true } } },
    });
  }

  async getSharedTransactions(spaceId: string) {
    return prisma.sharedTransaction.findMany({
      where: { spaceId },
      include: { author: { select: memberProfileSelect }, sharedBudget: { select: { categoryName: true } } },
      orderBy: { date: "desc" },
    });
  }

  async findTransactionById(id: string) {
    return prisma.sharedTransaction.findUnique({ where: { id } });
  }

  async updateSharedTransaction(
    id: string,
    data: { amount?: number; sharedBudgetId?: string | null; description?: string | null }
  ) {
    return prisma.sharedTransaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.sharedBudgetId !== undefined && { sharedBudgetId: data.sharedBudgetId }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        author: { select: memberProfileSelect },
        sharedBudget: { select: { categoryName: true } },
      },
    });
  }

  async deleteSharedTransaction(id: string) {
    await prisma.sharedTransaction.delete({ where: { id } });
  }

  async getSpentByBudget(sharedBudgetId: string): Promise<number> {
    const result = await prisma.sharedTransaction.aggregate({
      where: { sharedBudgetId },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }

  async setDeletionRequest(spaceId: string, userId: string | null) {
    return prisma.sharedSpace.update({
      where: { id: spaceId },
      data: { deletionRequestedBy: userId },
    });
  }

  async deleteSpace(spaceId: string) {
    await prisma.sharedSpace.delete({ where: { id: spaceId } });
  }

  async getTotalSpentBySpace(spaceId: string): Promise<number> {
    const result = await prisma.sharedTransaction.aggregate({
      where: { spaceId },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  }
}

export const spaceRepository = new SpaceRepository();
