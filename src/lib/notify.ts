import { prisma } from "./prisma";

// Fan-out an in-app notification to many users in one query.
export async function notifyUsers(userIds: number[], title: string, body: string, href?: string) {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return;
  await prisma.notification.createMany({
    data: unique.map((userId) => ({ userId, title, body, href })),
  });
}
