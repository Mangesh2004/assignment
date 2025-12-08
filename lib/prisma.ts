import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    }); // Note: Prisma 5.x handles timeouts via transaction options or global config, but simple instantiation is safer.

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
