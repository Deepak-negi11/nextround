import { requireRole } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  return (
    <div className="min-h-screen pt-14 md:pl-60 md:pt-0">
      <Sidebar user={user} />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
