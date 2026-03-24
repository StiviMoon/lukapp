import "express-async-errors";
import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import compression from "compression";
import { errorHandler, notFoundHandler } from "@/middleware/error-handler";
import apiRoutes from "@/routes";
import { checkDatabaseConnection } from "@/db/utils";

const app: Express = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || "256kb";

// Middleware
app.disable("x-powered-by");

// Excluir SSE de compression (los streams deben llegar sin buffering)
app.use(compression({
  filter: (req, res) => {
    if (req.path.includes("/coach/chat")) return false;
    return compression.filter(req, res);
  },
}));
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging en desarrollo
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rutas
app.use("/api", apiRoutes);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Lukapp Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      accounts: "/api/accounts",
      transactions: "/api/transactions",
      categories: "/api/categories",
      budgets: "/api/budgets",
    },
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.error("❌ Error: No se pudo conectar a la base de datos");
      process.exit(1);
    }
    console.log("✅ Conexión a la base de datos exitosa");

    // Verificar variables de entorno requeridas
    const requiredEnvVars = [
      "DATABASE_URL",
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingEnvVars.length > 0) {
      console.error(
        `❌ Error: Variables de entorno faltantes: ${missingEnvVars.join(", ")}`
      );
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();

// Manejo de cierre graceful
process.on("SIGTERM", async () => {
  console.log("SIGTERM recibido, cerrando servidor...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT recibido, cerrando servidor...");
  process.exit(0);
});

