import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { AdminLogin } from "@/components/AdminLogin";
import { GuestManager } from "@/components/GuestManager";
import { AdminTable } from "@/components/AdminTable";
import { db } from "@/lib/db";

const secret = () =>
  new TextEncoder().encode(
    process.env.ADMIN_SECRET || "development-only-change-me",
  );

export default async function Admin() {
  let authenticated = false;
  try {
    await jwtVerify(
      (await cookies()).get("wedding_admin")?.value || "",
      secret(),
    );
    authenticated = true;
  } catch {}

  if (!authenticated) return <AdminLogin />;

  const [guests, rsvps] = await Promise.all([
    db.guest.findMany({
      include: { rsvp: true },
      orderBy: { createdAt: "desc" },
    }),
    db.rsvp.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);
  const attending = rsvps.filter((rsvp) => rsvp.attending);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  return (
    <main className="admin">
      <header>
        <div>
          <p>WEDDING RSVP</p>
          <h1>Guest overview</h1>
        </div>
        <nav className="adminExports" aria-label="导出数据">
          <a href="/api/admin/guests/export">导出邀请名单</a>
          <a href="/api/admin/export">导出回执</a>
        </nav>
      </header>
      <section className="stats" aria-label="回执统计">
        <div><strong>{guests.reduce((sum, guest) => sum + guest.partySize, 0)}</strong><span>已邀请人数</span></div>
        <div><strong>{rsvps.length}</strong><span>已回复人数</span></div>
        <div><strong>{attending.length}</strong><span>确认出席</span></div>
        <div><strong>{attending.reduce((sum, rsvp) => sum + rsvp.partySize, 0)}</strong><span>预计席位</span></div>
        <div><strong>{rsvps.filter((rsvp) => !rsvp.attending).length}</strong><span>缺席人数</span></div>
      </section>
      <GuestManager
        siteUrl={siteUrl}
        guests={guests.map((guest) => ({
          id: guest.id,
          token: guest.token,
          name: guest.name,
          partySize: guest.partySize,
          groupName: guest.groupName,
          note: guest.note,
          sentAt: guest.sentAt?.toISOString() || null,
          rsvp: guest.rsvp
            ? { attending: guest.rsvp.attending, partySize: guest.rsvp.partySize }
            : null,
        }))}
      />
      <section className="adminSection">
        <div className="adminSectionHeading">
          <p>02 — RESPONSES</p>
          <h2>宾客回执</h2>
        </div>
        <AdminTable
          rows={rsvps.map((rsvp) => ({
            ...rsvp,
            createdAt: rsvp.createdAt.toISOString(),
          }))}
        />
      </section>
    </main>
  );
}
