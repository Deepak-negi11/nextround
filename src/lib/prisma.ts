import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Options for interactive transactions (`prisma.$transaction(async (tx) => …)`). Prisma's default
// 5-second limit is easy to hit on a remote database (~0.5 s per round trip to another region),
// so allow more time while keeping each transaction to a handful of statements.
export const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 } as const;
