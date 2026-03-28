import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdSchema,
  getTransactionsSchema,
} from "@/validations/transaction.schema";
import { transactionService } from "@/services/transaction.service";
import { profileRepository } from "@/repositories/profile.repository";
import { formatError } from "@/errors/error-handler";

const router = Router();

router.use(authenticate);

/**
 * POST /api/transactions
 * Crea una nueva transacción
 */
router.post(
  "/",
  validateBody(createTransactionSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const transaction = await transactionService.createTransaction(
        userId,
        req.body
      );

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      const formattedError = formatError(error);
      res.status(formattedError.statusCode).json({
        success: false,
        error: formattedError,
      });
    }
  }
);

/**
 * GET /api/transactions
 * Obtiene todas las transacciones del usuario con filtros
 */
router.get(
  "/",
  validateQuery(getTransactionsSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const filters = req.query as any;

      // FREE users: limit history to last 3 months
      const profile = await profileRepository.findByUserId(userId);
      if (profile?.plan !== "PREMIUM") {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (!filters.startDate || new Date(filters.startDate) < threeMonthsAgo) {
          filters.startDate = threeMonthsAgo.toISOString();
        }
      }

      const transactions = await transactionService.getTransactions(userId, filters);

      res.json({
        success: true,
        data: transactions,
        meta: profile?.plan === "FREE" ? { historyLimited: true, limitMonths: 3 } : undefined,
      });
    } catch (error) {
      const formattedError = formatError(error);
      res.status(formattedError.statusCode).json({
        success: false,
        error: formattedError,
      });
    }
  }
);

/**
 * GET /api/transactions/stats
 * Obtiene estadísticas de transacciones
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const stats = await transactionService.getTransactionStats(
      userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({
      success: false,
      error: formattedError,
    });
  }
});

/**
 * GET /api/transactions/:id
 * Obtiene una transacción por ID
 */
router.get(
  "/:id",
  validateParams(transactionIdSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const transaction = await transactionService.getTransactionById(
        String(req.params.id),
        userId
      );

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      const formattedError = formatError(error);
      res.status(formattedError.statusCode).json({
        success: false,
        error: formattedError,
      });
    }
  }
);

/**
 * PUT /api/transactions/:id
 * Actualiza una transacción
 */
router.put(
  "/:id",
  validateParams(transactionIdSchema),
  validateBody(updateTransactionSchema.partial()),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const id = String(req.params["id"]);
      const { id: _, ...data } = req.body;

      const transaction = await transactionService.updateTransaction(
        id,
        userId,
        data
      );

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      const formattedError = formatError(error);
      res.status(formattedError.statusCode).json({
        success: false,
        error: formattedError,
      });
    }
  }
);

/**
 * DELETE /api/transactions/:id
 * Elimina una transacción
 */
router.delete(
  "/:id",
  validateParams(transactionIdSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      await transactionService.deleteTransaction(String(req.params.id), userId);

      res.json({
        success: true,
        message: "Transacción eliminada exitosamente",
      });
    } catch (error) {
      const formattedError = formatError(error);
      res.status(formattedError.statusCode).json({
        success: false,
        error: formattedError,
      });
    }
  }
);

export default router;

