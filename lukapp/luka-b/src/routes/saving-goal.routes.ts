import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { savingGoalService } from "@/services/saving-goal.service";
import { formatError } from "@/errors/error-handler";

const router = Router();

router.use(authenticate);

// GET /api/saving-goals
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const goals = await savingGoalService.getGoals(userId);
    res.json({ success: true, data: goals });
  } catch (error) {
    const e = formatError(error);
    res.status(e.statusCode).json({ success: false, error: e });
  }
});

// POST /api/saving-goals
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const goal = await savingGoalService.createGoal(userId, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    const e = formatError(error);
    res.status(e.statusCode).json({ success: false, error: e });
  }
});

// PATCH /api/saving-goals/:id
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const goal = await savingGoalService.updateGoal(req.params.id as string, userId, req.body);
    res.json({ success: true, data: goal });
  } catch (error) {
    const e = formatError(error);
    res.status(e.statusCode).json({ success: false, error: e });
  }
});

// DELETE /api/saving-goals/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    await savingGoalService.deleteGoal(req.params.id as string, userId);
    res.json({ success: true, data: null });
  } catch (error) {
    const e = formatError(error);
    res.status(e.statusCode).json({ success: false, error: e });
  }
});

export default router;
