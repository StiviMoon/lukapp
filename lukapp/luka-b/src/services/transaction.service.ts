import { transactionRepository } from "@/repositories/transaction.repository";
import { accountRepository } from "@/repositories/account.repository";
import { budgetRepository } from "@/repositories/budget.repository";
import { pushService } from "@/services/push.service";
import { financialAnalyticsService } from "@/services/financial-analytics.service";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  GetTransactionsInput,
} from "@/validations/transaction.schema";
import { NotFoundError, ValidationError } from "@/errors/app-error";
import { TransactionType } from "@prisma/client";
import { prisma } from "@/db/client";

/**
 * Servicio para lógica de negocio de transacciones
 */
export class TransactionService {
  /**
   * Crea una nueva transacción y actualiza el balance de la cuenta
   */
  async createTransaction(userId: string, data: CreateTransactionInput) {
    const amountToUpdate =
      data.type === TransactionType.INCOME
        ? data.amount
        : data.type === TransactionType.EXPENSE
        ? -data.amount
        : 0; // TRANSFER se maneja por separado

    const transaction = await prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: { id: data.accountId, userId },
        select: { id: true },
      });
      if (!account) {
        throw new NotFoundError("Cuenta no encontrada");
      }

      if (data.categoryId) {
        const category = await tx.category.findFirst({
          where: { id: data.categoryId, userId },
          select: { id: true, type: true },
        });
        if (!category) {
          throw new NotFoundError("Categoría no encontrada");
        }

        if (category.type !== data.type) {
          throw new ValidationError(
            "El tipo de transacción no coincide con el tipo de categoría"
          );
        }
      }

      const created = await tx.transaction.create({
        data: {
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date ?? new Date(),
          periodicity: data.periodicity ?? "ONCE",
          userId,
          accountId: data.accountId,
          ...(data.categoryId && { categoryId: data.categoryId }),
        },
      });

      if (amountToUpdate !== 0) {
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: amountToUpdate,
            },
          },
        });
      }

      await tx.coachInsight.deleteMany({ where: { userId } });
      financialAnalyticsService.invalidateSummaryCache(userId);

      return created;
    });

    // Verificar si se excede algún presupuesto activo y enviar push
    if (data.type === TransactionType.EXPENSE && data.categoryId) {
      try {
        const activeBudgets = await budgetRepository.findActiveBudgets(userId);
        const matchingBudget = activeBudgets.find(
          (b) => b.categoryId === data.categoryId || (!b.categoryId && !data.categoryId)
        );

        if (matchingBudget) {
          const budgetCategoryId = matchingBudget.categoryId ?? undefined;
          const spent = await transactionRepository.getTotalByType(
            userId,
            TransactionType.EXPENSE,
            matchingBudget.startDate,
            matchingBudget.endDate,
            budgetCategoryId
          );

          const budgetAmount = Number(matchingBudget.amount);
          const pct = budgetAmount > 0 ? spent / budgetAmount : 0;
          const categoryName = matchingBudget.category?.name ?? "General";
          if (pct >= 1) {
            void pushService.sendToUser(userId, {
              title: "⚠️ Presupuesto excedido",
              body: `Superaste tu presupuesto de ${categoryName}. Gastado: $${Math.round(spent).toLocaleString("es-CO")}`,
              url: "/analytics",
            });
          } else if (pct >= 0.85) {
            void pushService.sendToUser(userId, {
              title: "📊 Vas al 85% de tu presupuesto",
              body: `Llevas $${Math.round(spent).toLocaleString("es-CO")} de $${Math.round(budgetAmount).toLocaleString("es-CO")} en ${categoryName}`,
              url: "/analytics",
            });
          }
        }
      } catch {
        // No interrumpir la transacción si falla el push
      }
    }

    return transaction;
  }

  /**
   * Obtiene todas las transacciones de un usuario con filtros
   */
  async getTransactions(userId: string, filters?: GetTransactionsInput) {
    return await transactionRepository.findByUserId(userId, {
      accountId: filters?.accountId,
      categoryId: filters?.categoryId,
      type: filters?.type,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      limit: filters?.limit,
      offset: filters?.offset,
    });
  }

  /**
   * Obtiene una transacción por ID
   */
  async getTransactionById(id: string, userId: string) {
    const transaction = await transactionRepository.findById(id, userId);

    if (!transaction) {
      throw new NotFoundError("Transacción no encontrada");
    }

    return transaction;
  }

  /**
   * Actualiza una transacción y ajusta el balance de la cuenta
   */
  async updateTransaction(
    id: string,
    userId: string,
    data: UpdateTransactionInput
  ) {
    const transaction = await transactionRepository.findById(id, userId);

    if (!transaction) {
      throw new NotFoundError("Transacción no encontrada");
    }

    // Calcular el monto actual de la transacción para revertir
    const currentAmount =
      transaction.type === TransactionType.INCOME
        ? Number(transaction.amount)
        : transaction.type === TransactionType.EXPENSE
        ? -Number(transaction.amount)
        : 0;

    // Calcular el nuevo monto de la transacción
    const newType = data.type ?? transaction.type;
    const newAmountValue = data.amount ?? Number(transaction.amount);
    const newAmount =
      newType === TransactionType.INCOME
        ? newAmountValue
        : newType === TransactionType.EXPENSE
        ? -newAmountValue
        : 0;

    // Si cambia la cuenta, necesitamos mover el balance entre cuentas
    if (data.accountId && data.accountId !== transaction.accountId) {
      // Revertir balance en cuenta antigua
      if (currentAmount !== 0) {
        await accountRepository.updateBalance(
          transaction.accountId,
          userId,
          -currentAmount
        );
      }

      // Aplicar balance en cuenta nueva
      if (newAmount !== 0) {
        await accountRepository.updateBalance(
          data.accountId,
          userId,
          newAmount
        );
      }
    } else {
      // Si no cambia la cuenta, solo ajustamos el balance
      const balanceDifference = newAmount - currentAmount;
      if (balanceDifference !== 0) {
        await accountRepository.updateBalance(
          transaction.accountId,
          userId,
          balanceDifference
        );
      }
    }

    return await transactionRepository.update(id, userId, {
      ...(data.accountId && {
        account: { connect: { id: data.accountId } },
      }),
      ...(data.categoryId !== undefined && {
        category: data.categoryId
          ? { connect: { id: data.categoryId } }
          : { disconnect: true },
      }),
      ...(data.type && { type: data.type }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.date && { date: data.date }),
      ...(data.periodicity !== undefined && { periodicity: data.periodicity }),
    });
  }

  /**
   * Elimina una transacción y revierte el balance de la cuenta
   */
  async deleteTransaction(id: string, userId: string) {
    const transaction = await transactionRepository.findById(id, userId);

    if (!transaction) {
      throw new NotFoundError("Transacción no encontrada");
    }

    // Revertir el balance de la cuenta
    const amountToRevert =
      transaction.type === TransactionType.INCOME
        ? -Number(transaction.amount)
        : transaction.type === TransactionType.EXPENSE
        ? Number(transaction.amount)
        : 0;

    if (amountToRevert !== 0) {
      await accountRepository.updateBalance(
        transaction.accountId,
        userId,
        amountToRevert
      );
    }

    await transactionRepository.delete(id, userId);
  }

  /**
   * Obtiene estadísticas de transacciones
   */
  async getTransactionStats(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const [income, expenses, incomeCount, expenseCount] = await Promise.all([
      transactionRepository.getTotalByType(
        userId,
        TransactionType.INCOME,
        startDate,
        endDate
      ),
      transactionRepository.getTotalByType(
        userId,
        TransactionType.EXPENSE,
        startDate,
        endDate
      ),
      transactionRepository.count(userId, {
        type: TransactionType.INCOME,
        startDate,
        endDate,
      }),
      transactionRepository.count(userId, {
        type: TransactionType.EXPENSE,
        startDate,
        endDate,
      }),
    ]);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      net: income - expenses,
      incomeCount,
      expenseCount,
    };
  }
}

export const transactionService = new TransactionService();

