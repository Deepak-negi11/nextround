-- Foreign-key indexes. PostgreSQL does not index foreign keys on its own; these support the joins
-- and lookups the app runs (drives of a company, an interviewer's rounds, results of a round) and
-- make the RESTRICT / CASCADE checks on delete cheap.
-- CreateIndex
CREATE INDEX "Drive_companyId_idx" ON "Drive"("companyId");

-- CreateIndex
CREATE INDEX "RoundPanelist_interviewerId_idx" ON "RoundPanelist"("interviewerId");

-- CreateIndex
CREATE INDEX "RoundResult_roundId_idx" ON "RoundResult"("roundId");

-- Domain integrity. The app validates these too, but the database is the last line of defence:
-- a bug, a script or a manual SQL edit can no longer store a CGPA of 42 or a slot that ends
-- before it starts. NULL passes a CHECK, so optional columns stay optional.
-- (Prisma's schema language can't express CHECK constraints, so they live here as plain SQL.)
ALTER TABLE "Student"
  ADD CONSTRAINT "Student_cgpa_range" CHECK ("cgpa" >= 0 AND "cgpa" <= 10),
  ADD CONSTRAINT "Student_activeBacklogs_nonneg" CHECK ("activeBacklogs" >= 0),
  ADD CONSTRAINT "Student_graduationYear_range" CHECK ("graduationYear" BETWEEN 2000 AND 2100);

ALTER TABLE "EligibilityRule"
  ADD CONSTRAINT "EligibilityRule_minimumCgpa_range" CHECK ("minimumCgpa" >= 0 AND "minimumCgpa" <= 10),
  ADD CONSTRAINT "EligibilityRule_maximumBacklogs_nonneg" CHECK ("maximumBacklogs" >= 0);

ALTER TABLE "Drive"
  ADD CONSTRAINT "Drive_package_positive" CHECK ("package" > 0);

ALTER TABLE "Offer"
  ADD CONSTRAINT "Offer_package_positive" CHECK ("package" > 0);

ALTER TABLE "Round"
  ADD CONSTRAINT "Round_roundNumber_positive" CHECK ("roundNumber" >= 1),
  ADD CONSTRAINT "Round_time_order" CHECK ("startAt" IS NULL OR "endAt" IS NULL OR "endAt" > "startAt");

ALTER TABLE "InterviewSlot"
  ADD CONSTRAINT "InterviewSlot_time_order" CHECK ("endAt" > "startAt");

ALTER TABLE "RoundResult"
  ADD CONSTRAINT "RoundResult_score_nonneg" CHECK ("score" >= 0),
  ADD CONSTRAINT "RoundResult_rank_positive" CHECK ("rank" >= 1);

ALTER TABLE "Roadmap"
  ADD CONSTRAINT "Roadmap_packageLpa_nonneg" CHECK ("packageLpa" >= 0);
