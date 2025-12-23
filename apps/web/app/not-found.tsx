import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6 py-16">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.08em] text-slate-500">404</p>
        <h1 className="text-3xl font-semibold text-slate-900">Страница не найдена</h1>
        <p className="text-slate-600">
          Кажется, вы перешли по несуществующей ссылке. Вернитесь на главную или выберите другой раздел.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-slate-900 text-white px-5 py-3 text-sm font-medium transition hover:bg-slate-800"
          >
            На главную
          </Link>
          <Link
            href="/demo"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100 transition"
          >
            В демо
          </Link>
        </div>
      </div>
    </main>
  );
}
