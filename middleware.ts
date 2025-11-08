import { NextRequest, NextResponse } from "next/server";
import { aj } from "@/lib/arcjet";

export async function middleware(request: NextRequest) {
  // Skip Arcjet protection if not configured (development mode)
  if (!aj) {
    return NextResponse.next();
  }

  // Apply basic Arcjet protection to all routes
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    } else if (decision.reason.isShield()) {
      return NextResponse.json(
        { error: "Request blocked for security reasons." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
