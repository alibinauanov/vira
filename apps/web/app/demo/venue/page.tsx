import Image from "next/image";
import Link from "next/link";
import { CalendarCheck2Icon, MessageCircleIcon, ReceiptIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const actions = [
  { label: "Забронировать стол", href: "/demo/booking-new", icon: CalendarCheck2Icon },
  { label: "WhatsApp", href: "https://wa.me/77071738530", icon: MessageCircleIcon, external: true },
  { label: "Сделать заказ", href: "/demo/order", icon: ReceiptIcon },
];

export default function VenuePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <p className="text-center text-xs uppercase tracking-[0.08em] text-slate-500">
          ваше заведение
        </p>

        <div className="flex justify-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
            <Image
              src="/coffee-logo2.avif"
              alt="Логотип кофейни"
              fill
              sizes="128px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                asChild
                className="h-12 w-full rounded-2xl bg-black text-white shadow-sm hover:bg-black/90"
              >
                <Link
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-center gap-2 text-base font-semibold"
                >
                  <Icon className="h-5 w-5" />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
