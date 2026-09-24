import { requireRole } from "@/lib/auth";
import { searchInternships } from "@/actions/internships";
import { PageHeader } from "@/components/ui";
import SearchForm from "./SearchForm";

export default async function InternshipsPage() {
  await requireRole("STUDENT");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Internship Finder"
        subtitle="Live internship listings pulled from the open web — search by role, skill or company."
      />
      <SearchForm action={searchInternships} />
    </div>
  );
}
