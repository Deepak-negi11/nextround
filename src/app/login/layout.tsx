import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, homeFor } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in — NextRound",
};

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user) redirect(homeFor(user.role));
  return children;
}
