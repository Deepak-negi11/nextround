import { Prisma } from "@prisma/client";

// True when a Prisma error means "couldn't talk to the database" (unreachable, timed out,
// pool exhausted) rather than a problem with the data itself.
const UNAVAILABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);

export function isDbUnavailable(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  if (e instanceof Prisma.PrismaClientKnownRequestError) return UNAVAILABLE_CODES.has(e.code);
  return false;
}

export const DB_UNAVAILABLE_MESSAGE = "We couldn't reach the database just now. Please try again in a moment.";
