import { budgetRepository } from "@/repositories/budget.repository";
import { transactionRepository } from "@/repositories/transaction.repository";
import { categoryRepository } from "@/repositories/category.repository";
import { CreateBudgetInput, UpdateBudgetInput } from "@/validations/budget.schema";
import { NotFoundError, ValidationError } from "@/errors/app-error";
import { TransactionType } from "@prisma/client";

/**
 * Servicio para lógica de negocio de presupuestos
 */
export class BudgetService {
  /**
   * Crea un nuevo presupuesto
   */
  async createBudget(userId: string, data: CreateBudgetInput) {
    // Verificar que las fechas son válidas
    if (data.endDate <= data.startDate) {
      throw new ValidationError(
        "La fecha de fin debe ser posterior a la fecha de inicio"
      );
    }

    // Verificar categoría si se proporciona
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId, userId);
      if (!category) {
        throw new NotFoundError("Categoría no encontrada");
      }
    }

    return await budgetRepository.create({
      amount: data.amount,
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      profile: {
        connect: { userId },
      },
      ...(data.categoryId
        ? {
            category: {
              connect: { id: data.categoryId },
            },
          }
        : {}),
    });
  }

  /**
   * Obtiene todos los presupuestos de un usuario
   */
  async getBudgets(userId: string, options?: {
    categoryId?: string;
    activeOnly?: boolean;
  }) {
    return await budgetRepository.findByUserId(userId, {
      categoryId: options?.categoryId,
      activeOnly: options?.activeOnly,
    });
  }

  /**
   * Obtiene un presupuesto por ID
   */
  async getBudgetById(id: string, userId: string) {
    const budget = await budgetRepository.findById(id, userId);

    if (!budget) {
      throw new NotFoundError("Presupuesto no encontrado");
    }

    return budget;
  }

  /**
   * Actualiza un presupuesto
   */
  async updateBudget(id: string, userId: string, data: UpdateBudgetInput) {
    const budget = await budgetRepository.findById(id, userId);

    if (!budget) {
      throw new NotFoundError("Presupuesto no encontrado");
    }

    // Validar fechas si se actualizan
    const startDate = data.startDate ?? budget.startDate;
    const endDate = data.endDate ?? budget.endDate;

    if (endDate <= startDate) {
      throw new ValidationError(
        "La fecha de fin debe ser posterior a la fecha de inicio"
      );
    }

    // Verificar categoría si se actualiza
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId, userId);
      if (!category) {
        throw new NotFoundError("Categoría no encontrada");
      }
    }

    return await budgetRepository.update(id, userId, {
      ...(data.categoryId !== undefined && {
        category: data.categoryId
          ? { connect: { id: data.categoryId } }
          : { disconnect: true },
      }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.period && { period: data.period }),
      ...(data.startDate && { startDate: data.startDate }),
      ...(data.endDate && { endDate: data.endDate }),
    });
  }

  /**
   * Elimina un presupuesto
   */
  async deleteBudget(id: string, userId: string) {
    const budget = await budgetRepository.findById(id, userId);

    if (!budget) {
      throw new NotFoundError("Presupuesto no encontrado");
    }

    await budgetRepository.delete(id, userId);
  }

  /**
   * Obtiene presupuestos activos y sus gastos actuales
   */
  async getBudgetStatus(userId: string, date: Date = new Date()) {
    const activeBudgets = await budgetRepository.findActiveBudgets(userId, date);

    const budgetsWithStatus = await Promise.all(
      activeBudgets.map(async (budget) => {
        // Calcular gastos: si tiene categoría, filtrar por categoría, sino todos los gastos
        const spent = await transactionRepository.getTotalByType(
          userId,
          TransactionType.EXPENSE,
          budget.startDate,
          budget.endDate,
          budget.categoryId ?? undefined
        );

        const amount = Number(budget.amount);
        const remaining = amount - spent;
        const percentage = amount > 0 ? (spent / amount) * 100 : 0;

        return {
          ...budget,
          spent,
          remaining,
          percentage,
          isExceeded: spent > amount,
        };
      })
    );

    return budgetsWithStatus;
  }
}

export const budgetService = new BudgetService();

