import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const demoSlug = "demo-restaurant";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16 text-left sm:px-8">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-sky-700">
            Демонстрация Taplink
          </span>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Быстрое бронирование и меню для ссылки в шапке профиля.
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Используйте демо-слуг ниже, чтобы пройти путь гостя. Админка и
            Taplink используют общую базу через Prisma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card/80 p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Попробуйте демо-слуг
            </p>
            <p className="text-lg font-semibold">{demoSlug}</p>
          </div>
          <div className="flex flex-1 flex-wrap justify-end gap-3">
            <Button variant="secondary" href={`/${demoSlug}/booking`}>
              Забронировать стол <ArrowRight className="size-4" />
            </Button>
            <Button href={`/${demoSlug}`}>
              Открыть карточку <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
