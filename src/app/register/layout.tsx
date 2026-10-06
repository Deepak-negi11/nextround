import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, homeFor } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account — NextRound",
};

export default async function RegisterLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user) redirect(homeFor(user.role));
  return children;
}
