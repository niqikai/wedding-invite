import { db } from "@/lib/db";
import { WeddingPage } from "@/components/WeddingPage";
export default async function Home({ searchParams }: { searchParams: Promise<{ guest?: string }> }) {
  const token = (await searchParams).guest?.toUpperCase();
  const guest = token ? await db.guest.findUnique({ where: { token }, select: { name: true, token: true, partySize: true, rsvp: { select: { attending: true, partySize: true, dietary: true, message: true } } } }) : null;
  return <WeddingPage guest={guest} invalidToken={Boolean(token && !guest)} />;
}
