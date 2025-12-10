import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 md:py-24 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-xs uppercase tracking-[0.08em]">
          <span>Демо</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
          Демо будет доступно скоро
        </h1>
        <p className="text-slate-600 text-lg">
          Мы готовим интерактивный пример работы Vira. Совсем скоро вы сможете протестировать продукт
          в режиме онлайн. Следите за обновлениями!
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Вернуться назад
          </Link>
        </div>
      </div>
    </main>
  );
}
