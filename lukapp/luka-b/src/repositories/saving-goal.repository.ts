import { prisma } from "@/db/client";
import { SavingGoal, Prisma } from "@prisma/client";

interface CreateGoalData {
  userId: string;
  name: string;
  targetAmount: number | string;
  savedAmount?: number | string;
  emoji?: string | null;
  deadline?: Date | null;
}

export class SavingGoalRepository {
  async create(data: CreateGoalData): Promise<SavingGoal> {
    return prisma.savingGoal.create({
      data: {
        userId: data.userId,
        name: data.name,
        targetAmount: data.targetAmount,
        savedAmount: data.savedAmount ?? 0,
        emoji: data.emoji ?? null,
        deadline: data.deadline ?? null,
      },
    });
  }

  async findByUserId(userId: string): Promise<SavingGoal[]> {
    return prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string, userId: string): Promise<SavingGoal | null> {
    return prisma.savingGoal.findFirst({ where: { id, userId } });
  }

  async update(id: string, _userId: string, data: Prisma.SavingGoalUpdateInput): Promise<SavingGoal> {
    return prisma.savingGoal.update({ where: { id }, data });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.savingGoal.deleteMany({ where: { id, userId } });
  }
}

export const savingGoalRepository = new SavingGoalRepository();
