/**
 * Prisma/next.js guide https://www.prisma.io/docs/orm/more/troubleshooting/nextjs
 *
 * Initializes a singleton Prisma client to prevent connection exhaustion
 * during development.
 */
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
