import { prisma } from "@/db/client";
import { SavingGoal, Prisma } from "@prisma/client";

export class SavingGoalRepository {
  async create(data: Prisma.SavingGoalCreateInput): Promise<SavingGoal> {
    return prisma.savingGoal.create({ data });
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
