// src/lib/db.ts
// Inicializa y exporta una única instancia de PrismaClient para toda la app (evita múltiples conexiones en desarrollo).
import { PrismaClient } from "@prisma/client";

// Permite reutilizar la instancia en hot reload (desarrollo)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // Loguea todas las queries en consola
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
