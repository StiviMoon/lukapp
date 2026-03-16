import { prisma } from "@/db/client";
import { Transaction, TransactionType, Prisma } from "@prisma/client";
import { NotFoundError } from "@/errors/app-error";

type TransactionWithRelations = Transaction & {
  account: {
    id: string;
    name: string;
    type: string;
  };
  category: {
    id: string;
    name: string;
    type: string;
  } | null;
};

/**
 * Repositorio para operaciones de base de datos de transacciones
 */
export class TransactionRepository {
  /**
   * Crea una nueva transacción
   */
  async create(
    data: Prisma.TransactionCreateInput
  ): Promise<Transaction> {
    return await prisma.transaction.create({
      data,
    });
  }

  /**
   * Encuentra una transacción por ID y userId
   */
  async findById(id: string, userId: string): Promise<TransactionWithRelations | null> {
    return await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    }) as TransactionWithRelations | null;
  }

  /**
   * Encuentra todas las transacciones de un usuario con filtros opcionales
   */
  async findByUserId(
    userId: string,
    options?: {
      accountId?: string;
      categoryId?: string;
      type?: TransactionType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<TransactionWithRelations[]> {
    return await prisma.transaction.findMany({
      where: {
        userId,
        ...(options?.accountId && { accountId: options.accountId }),
        ...(options?.categoryId && { categoryId: options.categoryId }),
        ...(options?.type && { type: options.type }),
        ...(options?.startDate || options?.endDate ? {
          date: {
            ...(options.startDate && { gte: options.startDate }),
            ...(options.endDate && { lte: options.endDate }),
          },
        } : {}),
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    }) as TransactionWithRelations[];
  }

  /**
   * Actualiza una transacción
   */
  async update(
    id: string,
    userId: string,
    data: Prisma.TransactionUpdateInput
  ): Promise<Transaction> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundError("Transacción no encontrada");
    }

    return await prisma.transaction.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina una transacción
   */
  async delete(id: string, userId: string): Promise<void> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundError("Transacción no encontrada");
    }

    await prisma.transaction.delete({
      where: { id },
    });
  }

  /**
   * Obtiene el total de ingresos/gastos por tipo
   */
  async getTotalByType(
    userId: string,
    type: TransactionType,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string
  ): Promise<number> {
    // Construir filtro de fechas
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = startDate;
    }
    if (endDate) {
      dateFilter.lte = endDate;
    }

    const result = await prisma.transaction.aggregate({
      where: {
        userId,
        type,
        ...(categoryId && { categoryId }),
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount ?? 0);
  }

  /**
   * Cuenta el total de transacciones de un usuario
   */
  async count(userId: string, filters?: {
    accountId?: string;
    categoryId?: string;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    return await prisma.transaction.count({
      where: {
        userId,
        ...filters,
        ...(filters?.startDate || filters?.endDate ? {
          date: {
            ...(filters.startDate && { gte: filters.startDate }),
            ...(filters.endDate && { lte: filters.endDate }),
          },
        } : {}),
      },
    });
  }
}

export const transactionRepository = new TransactionRepository();

