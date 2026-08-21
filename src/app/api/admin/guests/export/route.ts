import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const cell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return new NextResponse("Unauthorized", { status: 401 });
  const guests = await db.guest.findMany({ include: { rsvp: true }, orderBy: { createdAt: "asc" } });
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const rows = guests.map((guest) => [
    guest.name,
    guest.partySize,
    guest.groupName,
    guest.note,
    `${origin}/i/${guest.token}`,
    guest.sentAt ? "已发送" : "未发送",
    guest.rsvp ? (guest.rsvp.attending ? "出席" : "缺席") : "未回复",
  ].map(cell).join(","));
  const csv = ["姓名,邀请人数,分组,备注,专属链接,发送状态,回执状态", ...rows].join("\n");
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=guest-invitations.csv",
    },
  });
}
