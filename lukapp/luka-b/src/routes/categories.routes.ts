import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { validateBody, validateParams, validateQuery } from "@/middleware/validation";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from "@/validations/category.schema";
import { categoryService } from "@/services/category.service";
import { formatError } from "@/errors/error-handler";

const router = Router();

router.use(authenticate);

/**
 * POST /api/categories
 * Crea una nueva categoría
 */
router.post(
  "/",
  validateBody(createCategorySchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const category = await categoryService.createCategory(userId, req.body);

      res.status(201).json({
        success: true,
        data: category,
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
 * GET /api/categories
 * Obtiene todas las categorías del usuario
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { type } = req.query;

    const categories = await categoryService.getCategories(userId, {
      ...(type && { type: type as string }),
    });

    res.json({
      success: true,
      data: categories,
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
 * GET /api/categories/:id
 * Obtiene una categoría por ID
 */
router.get(
  "/:id",
  validateParams(categoryIdSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const category = await categoryService.getCategoryById(
        req.params.id,
        userId
      );

      res.json({
        success: true,
        data: category,
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
 * PUT /api/categories/:id
 * Actualiza una categoría
 */
router.put(
  "/:id",
  validateParams(categoryIdSchema),
  validateBody(updateCategorySchema.partial()),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { id: _, ...data } = req.body;

      const category = await categoryService.updateCategory(id, userId, data);

      res.json({
        success: true,
        data: category,
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
 * DELETE /api/categories/:id
 * Elimina una categoría
 */
router.delete(
  "/:id",
  validateParams(categoryIdSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      await categoryService.deleteCategory(req.params.id, userId);

      res.json({
        success: true,
        message: "Categoría eliminada exitosamente",
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

