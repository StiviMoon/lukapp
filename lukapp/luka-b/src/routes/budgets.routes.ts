import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { validateBody, validateParams } from "@/middleware/validation";
import {
  createBudgetSchema,
  updateBudgetBodySchema,
  budgetIdSchema,
} from "@/validations/budget.schema";
import { budgetService } from "@/services/budget.service";
import { formatError } from "@/errors/error-handler";

const router = Router();

router.use(authenticate);

/**
 * POST /api/budgets
 * Crea un nuevo presupuesto
 */
router.post(
  "/",
  validateBody(createBudgetSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const budget = await budgetService.createBudget(userId, req.body);

      res.status(201).json({
        success: true,
        data: budget,
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
 * GET /api/budgets
 * Obtiene todos los presupuestos del usuario
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { categoryId, activeOnly } = req.query;

    const budgets = await budgetService.getBudgets(userId, {
      ...(categoryId && { categoryId: categoryId as string }),
      activeOnly: activeOnly === "true",
    });

    res.json({
      success: true,
      data: budgets,
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
 * GET /api/budgets/status
 * Obtiene el estado de los presupuestos activos
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { date } = req.query;

    const status = await budgetService.getBudgetStatus(
      userId,
      date ? new Date(date as string) : new Date()
    );

    res.json({
      success: true,
      data: status,
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
 * GET /api/budgets/:id
 * Obtiene un presupuesto por ID
 */
router.get(
  "/:id",
  validateParams(budgetIdSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const budget = await budgetService.getBudgetById(
        String(req.params.id),
        userId
      );

      res.json({
        success: true,
        data: budget,
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
 * PUT /api/budgets/:id
 * Actualiza un presupuesto
 */
router.put(
  "/:id",
  validateParams(budgetIdSchema),
  validateBody(updateBudgetBodySchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const id = String(req.params["id"]);
      const { id: _, ...data } = req.body;

      const budget = await budgetService.updateBudget(id, userId, data);

      res.json({
        success: true,
        data: budget,
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
 * DELETE /api/budgets/:id
 * Elimina un presupuesto
 */
router.delete(
  "/:id",
  validateParams(budgetIdSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      await budgetService.deleteBudget(String(req.params.id), userId);

      res.json({
        success: true,
        message: "Presupuesto eliminado exitosamente",
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

