import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/AdminShell";
import { requireRestaurantContext } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurantContext(
    slug,
    `/${slug}/admin`,
  );
  if (restaurant.slug !== slug) {
    redirect(`/${restaurant.slug}/admin`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50">
      <AdminShell
        restaurant={{ slug: restaurant.slug, name: restaurant.name }}
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-10">
          {children}
        </div>
      </AdminShell>
    </div>
  );
}
