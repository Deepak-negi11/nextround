"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROADMAP_CATEGORIES } from "@/lib/constants";

export type ActionState = { error?: string; ok?: string };

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function refresh() {
  revalidatePath("/admin/roadmaps");
  revalidatePath("/student/roadmaps");
}

export async function createRoadmap(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const author = text(formData, "author");
  const company = text(formData, "company");
  const role = text(formData, "role");
  const category = text(formData, "category");
  const summary = text(formData, "summary");
  const timeline = text(formData, "timeline");
  const packageRaw = text(formData, "packageLpa");
  const packageLpa = packageRaw ? Number(packageRaw) : NaN;

  if (!author || !company || !role) return { error: "Author, company and role are required." };
  if (isNaN(packageLpa) || packageLpa < 0 || packageLpa > 1000) return { error: "Package (LPA) must be a number between 0 and 1000." };
  if (!ROADMAP_CATEGORIES.includes(category)) return { error: "Pick a category." };
  if (!summary || summary.length > 2000) return { error: "Summary is required (max 2000 characters)." };
  if (!timeline || timeline.length > 1000) return { error: "Timeline is required (max 1000 characters)." };

  await prisma.roadmap.create({ data: { author, company, role, packageLpa, category, summary, timeline } });
  refresh();
  return { ok: `Roadmap for ${company} added.` };
}

export async function deleteRoadmap(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("roadmapId"));
  if (!Number.isInteger(id)) return;
  await prisma.roadmap.deleteMany({ where: { id } }); // deleteMany: no error if already gone
  refresh();
}
