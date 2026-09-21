import { NextResponse } from "next/server";
import { getNotebookEntries } from "@/lib/content/notebook";

/**
 * GET /api/blog — notebook summaries as JSON.
 * Public reading is `/notebook`; this stays for any client that still fetches.
 */
export async function GET() {
  const entries = getNotebookEntries();
  return NextResponse.json({ articles: entries, entries, fetchedAt: new Date().toISOString() });
}
