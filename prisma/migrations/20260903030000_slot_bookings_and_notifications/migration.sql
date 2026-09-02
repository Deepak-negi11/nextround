-- DropIndex — the old global unique allowed only ONE booked slot per application, ever,
-- which silently broke slot booking for later interview rounds in the same drive.
DROP INDEX "InterviewSlot_bookedByApplicationId_key";

-- CreateIndex — an application may book at most one slot per round (multi-round safe)
CREATE UNIQUE INDEX "InterviewSlot_roundId_bookedByApplicationId_key" ON "InterviewSlot"("roundId", "bookedByApplicationId");

-- CreateTable — in-app notifications so students don't miss drive openings, rounds or results
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
