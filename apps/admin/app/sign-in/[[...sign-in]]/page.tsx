import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

export const dynamic = "force-dynamic";

const resolveRedirectUrl = (searchParams?: SearchParams) => {
  const raw = searchParams?.redirect_url ?? searchParams?.redirectUrl;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && value.startsWith("/")) return value;
  return "/admin";
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const { userId } = await auth();
  const redirectUrl = resolveRedirectUrl(resolvedSearchParams);
  if (userId) {
    redirect(redirectUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-white to-sky-50 px-4 py-10">
      <SignIn forceRedirectUrl={redirectUrl} />
    </div>
  );
}
