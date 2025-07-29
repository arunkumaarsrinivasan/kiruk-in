import { NextRequest, NextResponse } from "next/server";
import { aj } from "./lib/arcjet";

export async function middleware(request: NextRequest) {
  // Apply basic Arcjet protection to all routes
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    } else if (decision.reason.isBot()) {
      // Allow legitimate bots but log for monitoring
      const ip = request.headers.get("x-forwarded-for") || "unknown";
      console.log("Bot detected:", ip, request.headers.get("user-agent"));
      
      // For critical paths, you might want to block all bots
      if (request.nextUrl.pathname.startsWith("/api/chat")) {
        return NextResponse.json(
          { error: "Bot access not allowed for this endpoint." },
          { status: 403 }
        );
      }
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
