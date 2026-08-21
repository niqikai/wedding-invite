import { redirect } from "next/navigation";

export default async function InvitationRedirect({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/?guest=${encodeURIComponent(token.toUpperCase())}`);
}
