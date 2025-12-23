"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  Cog,
  LayoutGrid,
  Map,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

type Props = {
  restaurant: {
    slug: string;
    name: string;
  };
  children: ReactNode;
};

const navItems = [
  {
    label: "Бронирования",
    icon: CalendarClock,
    href: (slug: string) => `/${slug}/admin/reservations`,
  },
  {
    label: "Карта зала",
    icon: Map,
    href: (slug: string) => `/${slug}/admin/tables`,
  },
  {
    label: "Информация и меню",
    icon: LayoutGrid,
    href: (slug: string) => `/${slug}/admin/knowledge`,
  },
  {
    label: "Клиентская страница",
    icon: SlidersHorizontal,
    href: (slug: string) => `/${slug}/admin/customize`,
  },
  {
    label: "Интеграции",
    icon: Cog,
    href: (slug: string) => `/${slug}/admin/integrations`,
  },
  {
    label: "Профиль",
    icon: UserRound,
    href: (slug: string) => `/${slug}/admin/profile`,
  },
];

export function AdminShell({ restaurant, children }: Props) {
  const pathname = usePathname();
  const safeSlug = restaurant.slug ?? "";

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/80 p-4 shadow-sm">
        <div className="mb-6 flex flex-col gap-1">
          <Link
            href={safeSlug ? `/${safeSlug}/admin` : "#"}
            className="text-lg font-semibold leading-tight"
          >
            Vira Админ
          </Link>
          <p className="text-sm text-muted-foreground">
            {restaurant.name}
          </p>
          <Link
            href={safeSlug ? `/${safeSlug}` : "#"}
            className="text-xs font-medium text-primary underline"
          >
            Открыть таплинк
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const href = safeSlug ? item.href(safeSlug) : "#";
            const active = pathname === href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-primary/10",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 bg-transparent">
        <div className="flex items-center justify-end border-b border-border bg-white/80 px-6 py-3 shadow-xs">
          <UserButton />
        </div>
        {children}
      </main>
    </div>
  );
}
