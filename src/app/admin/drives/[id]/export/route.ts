import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { applicationLabel } from "@/components/ui/shared";

// Download a drive's applicants as CSV (opens in Excel / Google Sheets) to send to the company.
//   /admin/drives/:id/export             → every application
//   /admin/drives/:id/export?only=active → only students still in the running (applied or shortlisted)
// Layouts don't guard route handlers, so the admin check happens here.

const HEADERS = [
  "Name", "Email", "University roll no", "Enrollment no", "Branch", "CGPA",
  "Active backlogs", "Graduation year", "Resume link", "Applied on", "Status",
];

// Quote every cell, and neutralise values a spreadsheet would run as a formula (CSV injection).
function cell(value: string | number | null | undefined) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const driveId = parseInt(id);
  const onlyActive = new URL(request.url).searchParams.get("only") === "active";

  const drive = await prisma.drive.findUnique({
    where: { id: driveId },
    include: {
      company: true,
      applications: {
        where: onlyActive ? { applicationStatus: { in: ["APPLIED", "IN_PROGRESS"] } } : undefined,
        include: { student: { include: { user: true } }, _count: { select: { results: true } } },
        orderBy: { appliedAt: "asc" },
      },
    },
  });
  if (!drive) return new Response("Drive not found", { status: 404 });

  const rows = drive.applications.map((a) =>
    [
      a.student.user.name,
      a.student.user.email,
      a.student.rollNo,
      a.student.enrollmentNo,
      a.student.branch,
      a.student.cgpa,
      a.student.activeBacklogs,
      a.student.graduationYear,
      a.student.resumeLink,
      a.appliedAt.toISOString().slice(0, 10),
      applicationLabel(a.applicationStatus, a._count.results),
    ].map(cell).join(",")
  );
  // Leading BOM so Excel reads names with non-English letters correctly.
  const csv = "﻿" + [HEADERS.map(cell).join(","), ...rows].join("\r\n") + "\r\n";

  const slug = `${drive.company.companyName}-${drive.jobRole}`.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-${onlyActive ? "candidates" : "applicants"}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
