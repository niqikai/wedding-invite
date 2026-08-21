import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (typeof body?.sent !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  await db.guest.update({
    where: { id },
    data: { sentAt: body.sent ? new Date() : null },
  });
  return NextResponse.json({ ok: true });
}
