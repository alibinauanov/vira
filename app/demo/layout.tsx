"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarCheck2Icon,
  Plug2Icon,
  Repeat2Icon,
  SendIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type DemoLayoutProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/demo", label: "Чаты", icon: SendIcon },
  { href: "/demo/knowledge", label: "База знаний", icon: BookOpenIcon },
  { href: "/demo/booking", label: "Бронь", icon: CalendarCheck2Icon },
  { href: "/demo/subscriptions", label: "Подписки", icon: Repeat2Icon },
  { href: "/demo/analytics", label: "Статистика", icon: TrendingUpIcon },
  { href: "/demo/integrations", label: "Интеграции", icon: Plug2Icon },
];

export default function DemoLayout({ children }: DemoLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/demo") return pathname === "/demo";
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
        <SidebarHeader className="px-3 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/70 px-3 py-3 text-sidebar-foreground">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-sidebar-primary/90 ring-2 ring-sidebar-border">
              <Image src="/logo.png" alt="Vira" fill sizes="40px" className="object-cover" />
            </div>
            <div className="space-y-1 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold">Ваш ресторан</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={item.label} isActive={isActive(item.href)}>
                        <Link href={item.href} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2 pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Вернуться на сайт">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>На главную</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-2 group-data-[collapsible=icon]/sidebar:hidden">
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              Демо
            </Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">На сайт</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/#contact">Связаться</Link>
            </Button>
          </div>
        </header>

        <main className="px-4 py-8 md:px-8 md:py-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
