import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (p: string) => bcrypt.hashSync(p, 10);

async function main() {
  // 1. Placement Admin
  await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: {},
    create: {
      email: "admin@college.edu",
      passwordHash: hash("admin123"),
      name: "Placement Admin",
      role: "ADMIN",
    },
  });

  // 2. Default Interviewer
  await prisma.user.upsert({
    where: { email: "interviewer@college.edu" },
    update: {},
    create: {
      email: "interviewer@college.edu",
      passwordHash: hash("int123"),
      name: "Campus Interviewer",
      role: "INTERVIEWER",
    },
  });

  // 3. Default Student (for testing student drive applications & eligibility)
  const studentUser = await prisma.user.upsert({
    where: { email: "student@college.edu" },
    update: {},
    create: {
      email: "student@college.edu",
      passwordHash: hash("student123"),
      name: "Demo Student",
      role: "STUDENT",
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      rollNo: "2K23/CSE/101",
      branch: "CSE",
      cgpa: 8.5,
      activeBacklogs: 0,
      graduationYear: 2027,
    },
  });

  console.log("Seed complete. Default accounts created:");
  console.log("  - Admin:       admin@college.edu / admin123");
  console.log("  - Interviewer: interviewer@college.edu / int123");
  console.log("  - Student:     student@college.edu / student123");
  console.log("Companies, drives, rounds, and roadmaps can now be added dynamically via the portal.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

