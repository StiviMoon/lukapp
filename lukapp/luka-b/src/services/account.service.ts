import { accountRepository } from "@/repositories/account.repository";
import { transactionRepository } from "@/repositories/transaction.repository";
import { CreateAccountInput, UpdateAccountInput } from "@/validations/account.schema";
import { NotFoundError, ConflictError } from "@/errors/app-error";
import { AccountType } from "@prisma/client";

/**
 * Servicio para lógica de negocio de cuentas
 */
export class AccountService {
  /**
   * Crea una nueva cuenta
   */
  async createAccount(userId: string, data: CreateAccountInput) {
    return await accountRepository.create({
      name: data.name,
      type: data.type,
      balance: data.balance ?? 0,
      color: data.color,
      icon: data.icon,
      isActive: data.isActive ?? true,
      profile: {
        connect: { userId },
      },
    });
  }

  /**
   * Obtiene todas las cuentas de un usuario
   */
  async getAccounts(userId: string, options?: {
    includeInactive?: boolean;
    type?: AccountType;
  }) {
    return await accountRepository.findByUserId(userId, {
      includeInactive: options?.includeInactive,
      ...(options?.type && { type: options.type }),
    });
  }

  /**
   * Obtiene una cuenta por ID
   */
  async getAccountById(id: string, userId: string) {
    const account = await accountRepository.findById(id, userId);

    if (!account) {
      throw new NotFoundError("Cuenta no encontrada");
    }

    return account;
  }

  /**
   * Actualiza una cuenta
   */
  async updateAccount(id: string, userId: string, data: UpdateAccountInput) {
    const account = await accountRepository.findById(id, userId);

    if (!account) {
      throw new NotFoundError("Cuenta no encontrada");
    }

    return await accountRepository.update(id, userId, {
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    });
  }

  /**
   * Elimina una cuenta
   */
  async deleteAccount(id: string, userId: string, hardDelete: boolean = false) {
    const account = await accountRepository.findById(id, userId);

    if (!account) {
      throw new NotFoundError("Cuenta no encontrada");
    }

    // Verificar si la cuenta tiene transacciones
    const transactions = await transactionRepository.findByUserId(userId, {
      accountId: id,
      limit: 1,
    });

    if (transactions.length > 0 && hardDelete) {
      throw new ConflictError(
        "No se puede eliminar una cuenta que tiene transacciones. Desactívala en su lugar."
      );
    }

    await accountRepository.delete(id, userId, hardDelete);
  }

  /**
   * Obtiene el balance total de todas las cuentas
   */
  async getTotalBalance(userId: string) {
    return await accountRepository.getTotalBalance(userId);
  }

  /**
   * Actualiza el balance de una cuenta
   */
  async updateBalance(id: string, userId: string, amount: number) {
    return await accountRepository.updateBalance(id, userId, amount);
  }
}

export const accountService = new AccountService();

