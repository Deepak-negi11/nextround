import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

// Either the shared client or the client of a running transaction (`prisma.$transaction(async (tx) => …)`).
type Db = Prisma.TransactionClient;

// Fan-out an in-app notification to many users in one query. Pass a transaction client to make
// the notification part of the same all-or-nothing change as the event it announces.
export async function notifyUsers(userIds: number[], title: string, body: string, href?: string, db: Db = prisma) {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return;
  await db.notification.createMany({
    data: unique.map((userId) => ({ userId, title, body, href })),
  });
}
