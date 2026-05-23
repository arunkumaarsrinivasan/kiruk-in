import { NextRequest, NextResponse } from "next/server";
import { ajApi } from "@/lib/arcjet";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Public read-only endpoint: returns the count of recorded page-view
// interactions. Used by era homepages (e.g. the 1995 GeoCities hit
// counter) to surface a real visitor number rather than a faked one.
//
// Rate-limited via arcjet to discourage scraping; the value itself is
// not sensitive — same data already drives the admin dashboard.

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (ajApi) {
      const decision = await ajApi.protect(request, { requested: 1 });
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return NextResponse.json(
            { error: "Too many requests." },
            { status: 429 },
          );
        }
        if (decision.reason.isBot()) {
          return NextResponse.json(
            { error: "Bot traffic detected." },
            { status: 403 },
          );
        }
        return NextResponse.json(
          { error: "Access denied." },
          { status: 403 },
        );
      }
    }

    // Count rows in interaction_logs with action = 'page_view'.
    // head: true + count: 'exact' returns the count without rows.
    const { count, error } = await supabaseAdmin
      .from("interaction_logs")
      .select("*", { count: "exact", head: true })
      .eq("action", "page_view");

    if (error) {
      console.error("visitors count error:", error);
      return NextResponse.json({ total: null }, { status: 200 });
    }

    return NextResponse.json(
      { total: count ?? 0 },
      {
        status: 200,
        headers: {
          // Cache for a minute at the edge; the counter doesn't need to
          // be second-accurate and Supabase shouldn't be hammered.
          "cache-control": "public, max-age=60, s-maxage=60",
        },
      },
    );
  } catch (error) {
    console.error("visitors fetch error:", error);
    return NextResponse.json({ total: null }, { status: 200 });
  }
}
