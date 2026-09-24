"use server";

import { requireRole } from "@/lib/auth";
import { getFirecrawl } from "@/lib/firecrawl";
import type { Document, SearchResultWeb } from "firecrawl";

export type InternshipResult = {
  title: string;
  url: string;
  description: string;
  source: string;
};

export type InternshipSearchState = {
  error?: string;
  results?: InternshipResult[];
};

const SUGGESTED_ROLES = ["Software Engineer", "Data Analyst", "Web Development", "Machine Learning"];

export async function searchInternships(
  _prev: InternshipSearchState,
  formData: FormData,
): Promise<InternshipSearchState> {
  await requireRole("STUDENT");

  const q = String(formData.get("q") ?? "").trim().slice(0, 200);
  if (!q) return { error: "Type a role, skill or company to search for." };

  const fc = getFirecrawl();
  if (!fc) return { error: "Internship search is not configured (missing FIRECRAWL_API_KEY)." };

  try {
    const res = await fc.search(`${q} internship India 2026 apply`, { limit: 10 });
    // Search results are a union of plain web results and full scraped documents;
    // documents carry a markdown body, so use that to narrow the type (same
    // approach the Firecrawl SDK's own tests use).
    const results = (res.web ?? [])
      .filter((r): r is SearchResultWeb => {
        const w = r as SearchResultWeb;
        return typeof (r as Document).markdown !== "string" && Boolean(w.url) && Boolean(w.title);
      })
      .slice(0, 10)
      .map((r) => {
        let source = "web";
        try {
          source = new URL(r.url).hostname.replace(/^www\./, "");
        } catch {
          // keep default source when the URL is malformed
        }
        return { title: r.title!, url: r.url!, description: r.description ?? "", source };
      });
    return { results };
  } catch (err) {
    console.error("Firecrawl internship search failed:", err);
    return { error: "Search failed — try again in a moment." };
  }
}

export { SUGGESTED_ROLES };
