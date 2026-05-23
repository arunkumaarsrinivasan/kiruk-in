import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Constant-time comparison for admin Bearer tokens (Node runtime).
 */
export function verifyAdminBearer(request: NextRequest): boolean {
  const secret = process.env.ADMIN_API_TOKEN;
  const authHeader = request.headers.get("authorization");
  if (!secret || !authHeader?.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice(7);
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(secret, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
