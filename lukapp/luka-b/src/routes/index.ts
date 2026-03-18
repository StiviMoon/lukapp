import { Router } from "express";
import accountsRouter from "./accounts.routes";
import transactionsRouter from "./transactions.routes";
import categoriesRouter from "./categories.routes";
import budgetsRouter from "./budgets.routes";
import voiceRouter from "./voice.routes";
import contactsRouter from "./contacts.routes";
import spacesRouter from "./spaces.routes";

const router = Router();

/**
 * Rutas de la API
 */
router.use("/accounts", accountsRouter);
router.use("/transactions", transactionsRouter);
router.use("/categories", categoriesRouter);
router.use("/budgets", budgetsRouter);
router.use("/voice", voiceRouter);
router.use("/contacts", contactsRouter);
router.use("/spaces", spacesRouter);

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

