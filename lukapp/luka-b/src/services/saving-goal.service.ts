import { savingGoalRepository } from "@/repositories/saving-goal.repository";
import { NotFoundError } from "@/errors/app-error";

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  savedAmount?: number;
  emoji?: string;
  deadline?: string;
}

export interface UpdateGoalInput {
  name?: string;
  targetAmount?: number;
  savedAmount?: number;
  emoji?: string;
  deadline?: string;
  completed?: boolean;
}

export class SavingGoalService {
  async getGoals(userId: string) {
    return savingGoalRepository.findByUserId(userId);
  }

  async createGoal(userId: string, data: CreateGoalInput) {
    return savingGoalRepository.create({
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      savedAmount: data.savedAmount ?? 0,
      emoji: data.emoji ?? null,
      deadline: data.deadline ? new Date(data.deadline) : null,
    });
  }

  async updateGoal(id: string, userId: string, data: UpdateGoalInput) {
    const goal = await savingGoalRepository.findById(id, userId);
    if (!goal) throw new NotFoundError("Meta de ahorro no encontrada");

    return savingGoalRepository.update(id, userId, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
      ...(data.savedAmount !== undefined && { savedAmount: data.savedAmount }),
      ...(data.emoji !== undefined && { emoji: data.emoji }),
      ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
      ...(data.completed !== undefined && { completed: data.completed }),
    });
  }

  async deleteGoal(id: string, userId: string) {
    const goal = await savingGoalRepository.findById(id, userId);
    if (!goal) throw new NotFoundError("Meta de ahorro no encontrada");
    await savingGoalRepository.delete(id, userId);
  }
}

export const savingGoalService = new SavingGoalService();
