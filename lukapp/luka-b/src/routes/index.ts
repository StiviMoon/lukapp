import { Router } from "express";
import accountsRouter from "./accounts.routes";
import transactionsRouter from "./transactions.routes";
import categoriesRouter from "./categories.routes";
import budgetsRouter from "./budgets.routes";
import voiceRouter from "./voice.routes";
import contactsRouter from "./contacts.routes";
import spacesRouter from "./spaces.routes";
import pushRouter from "./push.routes";
import profileRouter from "./profile.routes";
import coachRouter from "./coach.routes";
import analyticsRouter from "./analytics.routes";
import subscriptionRouter from "./subscription.routes";

const router = Router();

/**
 * Rutas de la API
 */
router.use("/profile", profileRouter);
router.use("/accounts", accountsRouter);
router.use("/transactions", transactionsRouter);
router.use("/categories", categoriesRouter);
router.use("/budgets", budgetsRouter);
router.use("/voice", voiceRouter);
router.use("/contacts", contactsRouter);
router.use("/spaces", spacesRouter);
router.use("/push", pushRouter);
router.use("/coach", coachRouter);
router.use("/analytics", analyticsRouter);
router.use("/subscription", subscriptionRouter);

/**
 * GET /api/health
 * Endpoint de salud
 */
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

export default router;

