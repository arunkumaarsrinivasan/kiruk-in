import { NextRequest, NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/admin-auth";
import { PortfolioAnalytics } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminBearer(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Number.parseInt(url.searchParams.get("limit") || "50", 10);
    const safeLimit = Number.isFinite(limit)
      ? Math.min(200, Math.max(1, limit))
      : 50;

    const contacts = await PortfolioAnalytics.getContactSubmissions(safeLimit);

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Admin contacts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdminBearer(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      const text = await request.text();
      if (!text?.trim()) {
        return NextResponse.json(
          { error: "Request body is required" },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { id, action } = body as Record<string, unknown>;

    if (id === undefined || id === null || action === undefined || action === null) {
      return NextResponse.json(
        { error: "ID and action are required" },
        { status: 400 }
      );
    }

    if (typeof action !== "string" || typeof id !== "number") {
      return NextResponse.json(
        { error: "ID and action must be valid" },
        { status: 400 }
      );
    }

    if (action === "mark_read") {
      const success = await PortfolioAnalytics.markContactAsRead(id);
      if (success) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { error: "Failed to update contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin contact update error:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}
