import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateGuestToken } from "@/lib/guest-token";

const guestSchema = z.object({
  name: z.string().trim().min(1).max(60),
  partySize: z.number().int().min(1).max(20).default(1),
  groupName: z.string().trim().max(60).optional(),
  note: z.string().trim().max(200).optional(),
});

const importSchema = z.object({ guests: z.array(guestSchema).min(1).max(500) });

async function createGuest(data: z.infer<typeof guestSchema>) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await db.guest.create({
        data: {
          ...data,
          groupName: data.groupName || null,
          note: data.note || null,
          token: generateGuestToken(),
        },
      });
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  throw new Error("Unable to generate token");
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = body?.guests
    ? importSchema.safeParse(body)
    : guestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "宾客数据格式不正确。" }, { status: 400 });
  }
  if ("guests" in parsed.data) {
    const created = [];
    for (const guest of parsed.data.guests) created.push(await createGuest(guest));
    return NextResponse.json({ count: created.length }, { status: 201 });
  }
  return NextResponse.json(await createGuest(parsed.data), { status: 201 });
}
