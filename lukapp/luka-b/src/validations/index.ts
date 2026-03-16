/**
 * Índice de exportaciones para esquemas de validación
 */

// Cuentas
export {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
  type AccountIdInput,
} from "./account.schema";

// Transacciones
export {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdSchema,
  getTransactionsSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type TransactionIdInput,
  type GetTransactionsInput,
} from "./transaction.schema";

// Categorías
export {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryIdInput,
} from "./category.schema";

// Presupuestos
export {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdSchema,
  type CreateBudgetInput,
  type UpdateBudgetInput,
  type BudgetIdInput,
} from "./budget.schema";
