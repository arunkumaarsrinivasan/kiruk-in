import { NextRequest, NextResponse } from "next/server";
import { ajApi } from "@/lib/arcjet";
import { verifyAdminBearer } from "@/lib/admin-auth";
import { PortfolioAnalytics } from "@/lib/analytics";

const MAX_ANALYTICS_BODY_BYTES = 65536;
const ANALYTICS_ACTION_PATTERN = /^[a-z][a-z0-9_]{0,79}$/;
const MAX_SESSION_ID_LEN = 256;

function arcjetDeniedResponse(decision: {
  reason: { isRateLimit(): boolean; isBot(): boolean };
}): NextResponse {
  if (decision.reason.isRateLimit()) {
    return NextResponse.json(
      { error: "Too many analytics requests. Please try again later." },
      { status: 429 }
    );
  }
  if (decision.reason.isBot()) {
    return NextResponse.json(
      { error: "Bot traffic detected." },
      { status: 403 }
    );
  }
  return NextResponse.json({ error: "Access denied." }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    if (ajApi) {
      const decision = await ajApi.protect(request, { requested: 1 });
      if (decision.isDenied()) {
        return arcjetDeniedResponse(decision);
      }
    }

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    const text = await request.text();
    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }
    if (text.length > MAX_ANALYTICS_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details:
            parseError instanceof Error ? parseError.message : "Unknown error",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { action, data, sessionId } = body as Record<string, unknown>;

    if (typeof action !== "string" || !ANALYTICS_ACTION_PATTERN.test(action)) {
      return NextResponse.json(
        { error: "Invalid or disallowed action" },
        { status: 400 }
      );
    }

    if (sessionId !== undefined && sessionId !== null) {
      if (typeof sessionId !== "string" || sessionId.length > MAX_SESSION_ID_LEN) {
        return NextResponse.json(
          { error: "Invalid sessionId" },
          { status: 400 }
        );
      }
    }

    if (data !== undefined && data !== null) {
      const t = typeof data;
      if (t !== "object" && t !== "string" && t !== "number" && t !== "boolean") {
        return NextResponse.json({ error: "Invalid data payload" }, { status: 400 });
      }
      if (t === "object") {
        try {
          const serialized = JSON.stringify(data);
          if (serialized.length > 32000) {
            return NextResponse.json({ error: "Data payload too large" }, { status: 413 });
          }
        } catch {
          return NextResponse.json({ error: "Data payload not serializable" }, { status: 400 });
        }
      }
    }

    await PortfolioAnalytics.trackInteraction(
      action,
      data ?? undefined,
      typeof sessionId === "string" ? sessionId : undefined,
      request.headers.get("user-agent") || undefined,
      request.headers.get("x-forwarded-for") || "unknown"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      console.error("JSON parsing error:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body", details: error.message },
        { status: 400 }
      );
    }

    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track interaction" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminBearer(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const rawDays = Number.parseInt(url.searchParams.get("days") || "30", 10);
    const days = Number.isFinite(rawDays)
      ? Math.min(365, Math.max(1, rawDays))
      : 30;

    const analyticsData = await PortfolioAnalytics.getAnalyticsData(days);

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
