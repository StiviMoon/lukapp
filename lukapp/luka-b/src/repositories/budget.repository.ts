import { prisma } from "@/db/client";
import { Budget, Prisma } from "@prisma/client";
import { NotFoundError } from "@/errors/app-error";

type BudgetWithRelations = Budget & {
  category: {
    id: string;
    name: string;
  } | null;
};

/**
 * Repositorio para operaciones de base de datos de presupuestos
 */
export class BudgetRepository {
  /**
   * Crea un nuevo presupuesto
   */
  async create(data: Prisma.BudgetCreateInput): Promise<Budget> {
    return await prisma.budget.create({
      data,
    });
  }

  /**
   * Encuentra un presupuesto por ID y userId
   */
  async findById(id: string, userId: string): Promise<BudgetWithRelations | null> {
    return await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }) as BudgetWithRelations | null;
  }

  /**
   * Encuentra todos los presupuestos de un usuario
   */
  async findByUserId(
    userId: string,
    options?: {
      categoryId?: string;
      activeOnly?: boolean;
    }
  ): Promise<BudgetWithRelations[]> {
    const now = new Date();

    return await prisma.budget.findMany({
      where: {
        userId,
        ...(options?.categoryId && { categoryId: options.categoryId }),
        ...(options?.activeOnly && {
          startDate: { lte: now },
          endDate: { gte: now },
        }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }) as BudgetWithRelations[];
  }

  /**
   * Actualiza un presupuesto
   */
  async update(
    id: string,
    userId: string,
    data: Prisma.BudgetUpdateInput
  ): Promise<Budget> {
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!budget) {
      throw new NotFoundError("Presupuesto no encontrado");
    }

    return await prisma.budget.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina un presupuesto
   */
  async delete(id: string, userId: string): Promise<void> {
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!budget) {
      throw new NotFoundError("Presupuesto no encontrado");
    }

    await prisma.budget.delete({
      where: { id },
    });
  }

  /**
   * Elimina todos los presupuestos de una categoría específica (para cuando se elimina la categoría)
   */
  async deleteByCategoryId(categoryId: string, userId: string): Promise<void> {
    await prisma.budget.deleteMany({ where: { categoryId, userId } });
  }

  /**
   * Elimina presupuestos huérfanos (sin categoría) de un usuario
   */
  async deleteOrphaned(userId: string): Promise<void> {
    await prisma.budget.deleteMany({ where: { categoryId: null, userId } });
  }

  /**
   * Encuentra presupuestos activos para una fecha específica
   */
  async findActiveBudgets(
    userId: string,
    date: Date = new Date()
  ): Promise<BudgetWithRelations[]> {
    return await prisma.budget.findMany({
      where: {
        userId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }) as BudgetWithRelations[];
  }
}

export const budgetRepository = new BudgetRepository();

