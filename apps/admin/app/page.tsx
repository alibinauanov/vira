import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const demoSlug = "demo-restaurant";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16 sm:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Админ
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Откройте админскую панель для своего заведения
          </h1>
        </div>

        <Button href={`/${demoSlug}/admin`}>
          Открыть админ <ArrowRight className="size-4" />
        </Button>

        {/* <Card className="bg-white/80">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{demoSlug}</p>
            </div>

          </CardContent>
        </Card> */}
      </div>
    </main>
  );
}
