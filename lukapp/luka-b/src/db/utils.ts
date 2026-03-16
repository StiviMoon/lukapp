import { prisma } from "./client";

/**
 * Utilidades para trabajar con la base de datos
 */

/**
 * Verifica la conexión a la base de datos
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * Cierra la conexión a la base de datos
 * Útil para scripts o cuando necesites cerrar explícitamente
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  await prisma.$disconnect();
};

