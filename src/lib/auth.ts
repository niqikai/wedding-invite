import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
const secret = () => new TextEncoder().encode(process.env.ADMIN_SECRET || "development-only-change-me");
export async function createAdminToken() { return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("12h").sign(secret()); }
export async function isAdmin(request: NextRequest) { try { await jwtVerify(request.cookies.get("wedding_admin")?.value || "", secret()); return true; } catch { return false; } }
