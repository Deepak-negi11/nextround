import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import StudentForm from "./StudentForm";
import InterviewerForm from "./InterviewerForm";
import StudentRow from "./StudentRow";

export default async function UsersPage() {
  await requireRole("ADMIN");

  const [students, interviewers] = await Promise.all([
    prisma.student.findMany({ include: { user: true }, orderBy: { rollNo: "asc" } }),
    prisma.user.findMany({
      where: { role: "INTERVIEWER" },
      include: { _count: { select: { panelRounds: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Users" subtitle="Create student and interviewer accounts. Students can also sign up themselves with a college email." />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <StudentForm />
        <InterviewerForm />
      </div>

      <Card title={`Students (${students.length})`}>
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">No students yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2">University roll no</th><th className="pb-2">Enrollment no</th><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Branch</th><th className="pb-2">CGPA</th><th className="pb-2">Backlogs</th><th className="pb-2">Batch</th><th className="pb-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <StudentRow
                    key={s.id}
                    s={{
                      id: s.id,
                      rollNo: s.rollNo,
                      enrollmentNo: s.enrollmentNo,
                      name: s.user.name,
                      email: s.user.email,
                      branch: s.branch,
                      cgpa: s.cgpa,
                      activeBacklogs: s.activeBacklogs,
                      graduationYear: s.graduationYear,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title={`Interviewers (${interviewers.length})`}>
        {interviewers.length === 0 ? (
          <p className="text-sm text-slate-500">No interviewers yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {interviewers.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <p className="text-xs text-slate-500">{u._count.panelRounds} round(s) assigned</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
