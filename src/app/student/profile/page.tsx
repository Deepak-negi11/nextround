import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { updateProfile } from "@/actions/student";
import ProfileForm from "./ProfileForm";
import { PageHeader } from "@/components/ui";

export default async function ProfilePage() {
  const user = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student) return <p>No student profile found.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="My profile" subtitle="Your branch, CGPA and backlogs drive eligibility — keep them accurate." />
      <ProfileForm
        initial={{
          name: user.name,
          rollNo: student.rollNo,
          branch: student.branch,
          cgpa: student.cgpa,
          activeBacklogs: student.activeBacklogs,
          graduationYear: student.graduationYear,
          resumeLink: student.resumeLink ?? "",
        }}
        action={updateProfile}
      />
    </div>
  );
}
