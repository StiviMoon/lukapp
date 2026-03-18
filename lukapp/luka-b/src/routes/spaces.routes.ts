import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { validateBody, validateParams } from "@/middleware/validation";
import {
  createSpaceSchema,
  updateSalarySchema,
  createSharedBudgetSchema,
  updateSharedBudgetSchema,
  addSharedTransactionSchema,
  updateSharedTransactionSchema,
  spaceIdSchema,
  spaceBudgetParamsSchema,
  spaceTxParamsSchema,
} from "@/validations/space.schema";
import { spaceService } from "@/services/space.service";
import { formatError } from "@/errors/error-handler";

const router = Router();

router.use(authenticate);

/**
 * POST /api/spaces/:id/request-deletion
 * Solicita eliminar la sala (requiere confirmación del partner)
 */
router.post(
  "/:id/request-deletion",
  validateParams(spaceIdSchema),
  async (req: Request, res: Response) => {
    try {
      const space = await spaceService.requestDeletion(String(req.params.id), req.userId!);
      res.json({ success: true, data: space });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * DELETE /api/spaces/:id/confirm-deletion
 * El partner confirma y la sala se elimina definitivamente
 */
router.delete(
  "/:id/confirm-deletion",
  validateParams(spaceIdSchema),
  async (req: Request, res: Response) => {
    try {
      await spaceService.confirmAndDelete(String(req.params.id), req.userId!);
      res.json({ success: true, message: "Sala eliminada" });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * POST /api/spaces/:id/cancel-deletion
 * Cancela la solicitud de eliminación
 */
router.post(
  "/:id/cancel-deletion",
  validateParams(spaceIdSchema),
  async (req: Request, res: Response) => {
    try {
      const space = await spaceService.cancelDeletion(String(req.params.id), req.userId!);
      res.json({ success: true, data: space });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * GET /api/spaces/overview
 * Resumen de gastos compartidos para el dashboard (DEBE ir antes de /:id)
 */
router.get("/overview", async (req: Request, res: Response) => {
  try {
    const overview = await spaceService.getSharedOverview(req.userId!);
    res.json({ success: true, data: overview });
  } catch (error) {
    const e = formatError(error);
    res.status(e.statusCode).json({ success: false, error: e });
  }
});

/**
 * POST /api/spaces
 * Crea una sala compartida
 */
router.post(
  "/",
  validateBody(createSpaceSchema),
  async (req: Request, res: Response) => {
    try {
      const space = await spaceService.createSpace(req.userId!, req.body);
      res.status(201).json({ success: true, data: space });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * GET /api/spaces
 * Lista mis salas compartidas
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const spaces = await spaceService.getMySpaces(req.userId!);
    res.json({ success: true, data: spaces });
  } catch (error) {
    const e = formatError(error);
    res.status(e.statusCode).json({ success: false, error: e });
  }
});

/**
 * GET /api/spaces/:id
 * Detalle de una sala
 */
router.get(
  "/:id",
  validateParams(spaceIdSchema),
  async (req: Request, res: Response) => {
    try {
      const space = await spaceService.getSpaceById(String(req.params.id), req.userId!);
      res.json({ success: true, data: space });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * PUT /api/spaces/:id/salary
 * Actualiza mi salario en la sala
 */
router.put(
  "/:id/salary",
  validateParams(spaceIdSchema),
  validateBody(updateSalarySchema),
  async (req: Request, res: Response) => {
    try {
      const member = await spaceService.updateSalary(String(req.params.id), req.userId!, req.body.salary);
      res.json({ success: true, data: member });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * GET /api/spaces/:id/status
 * Estado de presupuestos (gastado/restante)
 */
router.get(
  "/:id/status",
  validateParams(spaceIdSchema),
  async (req: Request, res: Response) => {
    try {
      const status = await spaceService.getSpaceStatus(String(req.params.id), req.userId!);
      res.json({ success: true, data: status });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * POST /api/spaces/:id/budgets
 * Crea un presupuesto compartido
 */
router.post(
  "/:id/budgets",
  validateParams(spaceIdSchema),
  validateBody(createSharedBudgetSchema),
  async (req: Request, res: Response) => {
    try {
      const budget = await spaceService.createSharedBudget(String(req.params.id), req.userId!, req.body);
      res.status(201).json({ success: true, data: budget });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * PUT /api/spaces/:id/budgets/:budgetId
 * Actualiza un presupuesto compartido
 */
router.put(
  "/:id/budgets/:budgetId",
  validateParams(spaceBudgetParamsSchema),
  validateBody(updateSharedBudgetSchema),
  async (req: Request, res: Response) => {
    try {
      const budget = await spaceService.updateSharedBudget(
        String(req.params.budgetId),
        String(req.params.id),
        req.userId!,
        req.body
      );
      res.json({ success: true, data: budget });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * DELETE /api/spaces/:id/budgets/:budgetId
 * Elimina un presupuesto compartido
 */
router.delete(
  "/:id/budgets/:budgetId",
  validateParams(spaceBudgetParamsSchema),
  async (req: Request, res: Response) => {
    try {
      await spaceService.deleteSharedBudget(String(req.params.budgetId), String(req.params.id), req.userId!);
      res.json({ success: true, message: "Presupuesto eliminado" });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * POST /api/spaces/:id/transactions
 * Registra un gasto compartido
 */
router.post(
  "/:id/transactions",
  validateParams(spaceIdSchema),
  validateBody(addSharedTransactionSchema),
  async (req: Request, res: Response) => {
    try {
      const tx = await spaceService.addTransaction(String(req.params.id), req.userId!, req.body);
      res.status(201).json({ success: true, data: tx });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * GET /api/spaces/:id/transactions
 * Lista transacciones de la sala
 */
router.get(
  "/:id/transactions",
  validateParams(spaceIdSchema),
  async (req: Request, res: Response) => {
    try {
      const transactions = await spaceService.getTransactions(String(req.params.id), req.userId!);
      res.json({ success: true, data: transactions });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * PUT /api/spaces/:id/transactions/:txId
 * Edita una transacción compartida (cualquier miembro)
 */
router.put(
  "/:id/transactions/:txId",
  validateParams(spaceTxParamsSchema),
  validateBody(updateSharedTransactionSchema),
  async (req: Request, res: Response) => {
    try {
      const tx = await spaceService.editTransaction(
        String(req.params.txId),
        String(req.params.id),
        req.userId!,
        req.body
      );
      res.json({ success: true, data: tx });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * DELETE /api/spaces/:id/transactions/:txId
 * Elimina una transacción compartida
 */
router.delete(
  "/:id/transactions/:txId",
  validateParams(spaceTxParamsSchema),
  async (req: Request, res: Response) => {
    try {
      await spaceService.deleteTransaction(String(req.params.txId), String(req.params.id), req.userId!);
      res.json({ success: true, message: "Transacción eliminada" });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

export default router;
