import { prisma } from "@/db/client";
import { Account, AccountType, Prisma } from "@prisma/client";
import { NotFoundError } from "@/errors/app-error";

/**
 * Repositorio para operaciones de base de datos de cuentas
 */
export class AccountRepository {
  /**
   * Crea una nueva cuenta
   */
  async create(
    data: Prisma.AccountCreateInput
  ): Promise<Account> {
    return await prisma.account.create({
      data,
    });
  }

  /**
   * Encuentra una cuenta por ID y userId
   */
  async findById(id: string, userId: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  /**
   * Encuentra todas las cuentas de un usuario
   */
  async findByUserId(
    userId: string,
    options?: {
      includeInactive?: boolean;
      type?: AccountType;
    }
  ): Promise<Account[]> {
    return await prisma.account.findMany({
      where: {
        userId,
        ...(options?.includeInactive !== true && { isActive: true }),
        ...(options?.type && { type: options.type }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Actualiza una cuenta
   */
  async update(
    id: string,
    userId: string,
    data: Prisma.AccountUpdateInput
  ): Promise<Account> {
    const account = await this.findById(id, userId);

    if (!account) {
      throw new NotFoundError("Cuenta no encontrada");
    }

    return await prisma.account.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina una cuenta (soft delete o hard delete)
   */
  async delete(id: string, userId: string, hardDelete: boolean = false): Promise<void> {
    const account = await this.findById(id, userId);

    if (!account) {
      throw new NotFoundError("Cuenta no encontrada");
    }

    if (hardDelete) {
      await prisma.account.delete({
        where: { id },
      });
    } else {
      await prisma.account.update({
        where: { id },
        data: { isActive: false },
      });
    }
  }

  /**
   * Actualiza el balance de una cuenta
   */
  async updateBalance(
    id: string,
    userId: string,
    amount: number
  ): Promise<Account> {
    const account = await this.findById(id, userId);

    if (!account) {
      throw new NotFoundError("Cuenta no encontrada");
    }

    return await prisma.account.update({
      where: { id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  /**
   * Obtiene el balance total de todas las cuentas de un usuario
   */
  async getTotalBalance(userId: string): Promise<number> {
    const result = await prisma.account.aggregate({
      where: {
        userId,
        isActive: true,
      },
      _sum: {
        balance: true,
      },
    });

    return Number(result._sum.balance ?? 0);
  }
}

export const accountRepository = new AccountRepository();

