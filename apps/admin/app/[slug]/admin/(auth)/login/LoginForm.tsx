"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/${slug}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Неверный пароль.");
      }
      router.replace(`/${slug}/admin/reservations`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось войти.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContent>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">
          <Lock className="size-4" />
          <span>Админ-доступ защищает изменения и удаления.</span>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Пароль
          </label>
          <Input
            type="password"
            name="password"
            value={password}
            placeholder="Введите пароль администратора"
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Пароль по умолчанию —{" "}
            <span className="font-semibold">admin123</span>. Укажите
            ADMIN_PASSWORD для замены.
          </p>
        </div>
        {error ? (
          <p className="text-sm font-semibold text-destructive">{error}</p>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <Button type="submit" loading={loading}>
            <LogIn className="size-4" />
            Войти
          </Button>
          <Button variant="ghost" href={`/${slug}`}>
            Назад к таплинку
          </Button>
        </div>
      </form>
    </CardContent>
  );
}
