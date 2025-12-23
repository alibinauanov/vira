import { redirect } from "next/navigation";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const redirectTarget = `/admin?next=/${slug}/admin`;
  redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectTarget)}`);
}
