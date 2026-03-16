import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { validateBody, validateParams } from "@/middleware/validation";
import {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
} from "@/validations/account.schema";
import { accountService } from "@/services/account.service";
import { formatError } from "@/errors/error-handler";
import { AccountType } from "@prisma/client";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * POST /api/accounts
 * Crea una nueva cuenta
 */
router.post(
  "/",
  validateBody(createAccountSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const account = await accountService.createAccount(userId, req.body);

      res.status(201).json({
        success: true,
        data: account,
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
 * GET /api/accounts
 * Obtiene todas las cuentas del usuario
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { includeInactive, type } = req.query;

    const accounts = await accountService.getAccounts(userId, {
      includeInactive: includeInactive === "true",
      ...(type && typeof type === "string" && { type: type as AccountType }),
    });

    res.json({
      success: true,
      data: accounts,
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
 * GET /api/accounts/:id
 * Obtiene una cuenta por ID
 */
router.get(
  "/:id",
  validateParams(accountIdSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const accountId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
      const account = await accountService.getAccountById(accountId, userId);

      res.json({
        success: true,
        data: account,
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
 * PUT /api/accounts/:id
 * Actualiza una cuenta
 */
router.put(
  "/:id",
  validateParams(accountIdSchema),
  validateBody(updateAccountSchema.partial()),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { id: _, ...data } = req.body;

      const account = await accountService.updateAccount(id, userId, data);

      res.json({
        success: true,
        data: account,
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
 * DELETE /api/accounts/:id
 * Elimina una cuenta
 */
router.delete(
  "/:id",
  validateParams(accountIdSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const hardDelete = req.query.hardDelete === "true";

      await accountService.deleteAccount(req.params.id, userId, hardDelete);

      res.json({
        success: true,
        message: "Cuenta eliminada exitosamente",
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
 * GET /api/accounts/balance/total
 * Obtiene el balance total de todas las cuentas
 */
router.get("/balance/total", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const total = await accountService.getTotalBalance(userId);

    res.json({
      success: true,
      data: { total },
    });
  } catch (error) {
    const formattedError = formatError(error);
    res.status(formattedError.statusCode).json({
      success: false,
      error: formattedError,
    });
  }
});

export default router;

