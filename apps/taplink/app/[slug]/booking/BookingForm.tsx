"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, MessageCircle } from "lucide-react";

import { type ReservationDTO } from "@vira/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDateLabel, formatTime } from "@/lib/utils";

type Props = {
  slug: string;
  whatsappPhone?: string | null;
  floorPlan?: {
    canvasWidth: number;
    canvasHeight: number;
    tables: Array<{
      id?: number;
      number: string;
      label?: string | null;
      seats: number;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number | null;
    }>;
  } | null;
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
const toTimeInputValue = (date: Date) =>
  date.toISOString().slice(11, 16);

export function BookingForm({ slug, whatsappPhone, floorPlan }: Props) {
  const tableOptions = useMemo(() => {
    if (!floorPlan?.tables?.length) return [];
    return [...floorPlan.tables].sort((a, b) =>
      a.number.localeCompare(b.number, "ru", { numeric: true }),
    );
  }, [floorPlan]);
  const [date, setDate] = useState(() => toDateInputValue(new Date()));

  const [time, setTime] = useState(() => {
    const now = new Date();
    const roundedMinutes = Math.ceil(now.getMinutes() / 30) * 30;
    now.setMinutes(roundedMinutes, 0, 0);
    return toTimeInputValue(now);
  });

  const [duration, setDuration] = useState(120);
  const [partySize, setPartySize] = useState(2);
  const [selectedTableNumber, setSelectedTableNumber] = useState(
    floorPlan?.tables?.[0]?.number ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<ReservationDTO | null>(null);

  const startDate = useMemo(
    () => new Date(`${date}T${time}:00`),
    [date, time],
  );

  const startIso = useMemo(
    () => startDate.toISOString(),
    [startDate],
  );

  const selectedTable = useMemo(
    () =>
      tableOptions.find((table) => table.number === selectedTableNumber) ??
      tableOptions[0],
    [selectedTableNumber, tableOptions],
  );

  useEffect(() => {
    if (!tableOptions.length) {
      setSelectedTableNumber("");
      return;
    }
    setSelectedTableNumber((prev) => {
      const existing = tableOptions.find((table) => table.number === prev);
      if (existing && existing.seats >= partySize) return prev;
      const next =
        tableOptions.find((table) => table.seats >= partySize) ??
        tableOptions[0];
      return next.number;
    });
  }, [partySize, tableOptions]);

  const phoneDigits = (whatsappPhone ?? "").replace(/[^\d]/g, "");
  const hasWhatsapp = phoneDigits.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const comment = String(formData.get("comment") ?? "").trim();
    const hasTables = tableOptions.length > 0;
    const tableLabel = selectedTable?.number?.trim();
    const tableSeats = Number.isFinite(selectedTable?.seats)
      ? selectedTable?.seats
      : undefined;

    if (hasTables && (!selectedTable || !tableLabel)) {
      setError("Выберите стол.");
      return;
    }

    if (!name || !phone) {
      setError("Имя и телефон обязательны.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/${slug}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          tableLabel: tableLabel ?? undefined,
          tableSeats: tableLabel
            ? tableSeats ?? partySize
            : undefined,
          partySize,
          startAt: startIso,
          durationMinutes: duration,
          name,
          phone,
          comment: comment || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось создать бронь");
      }
      setSuccess(body.reservation as ReservationDTO);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось создать бронь",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSuccess(null);
    setError(null);
  };

  if (success) {
    const reservedStart = new Date(success.startAt);
    const reservedEnd = new Date(success.endAt);
    const message = `Здравствуйте! Подтвердите, пожалуйста, бронь стола ${success.tableLabel ?? ""} на ${success.partySize} чел. ${formatDateLabel(reservedStart)} в ${formatTime(reservedStart)}. Имя: ${success.name}.`;

    return (
      <div className="grid gap-6 sm:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="size-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Бронь оформлена
              </span>
            </div>
            <h2 className="text-2xl font-semibold leading-tight">
              Мы получили заявку!
            </h2>
            <p className="text-muted-foreground">
              Подтверждаем детали через WhatsApp.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="neutral">
                  {formatDateLabel(reservedStart)}
                </Badge>
                <Badge tone="neutral">
                  {formatTime(reservedStart)} – {formatTime(reservedEnd)}
                </Badge>
              </div>
              <p className="mt-2 text-lg font-semibold">
                {success.name} · {success.partySize} гостей
              </p>
              <p className="text-sm text-muted-foreground">
                Стол {success.tableLabel ?? "—"} ·{" "}
                {success.tableSeats ?? "?"} мест · {success.phone}
              </p>
              {success.comment ? (
                <p className="text-sm text-muted-foreground">
                  Комментарий: {success.comment}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                href={
                  hasWhatsapp
                    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`
                    : undefined
                }
                disabled={!hasWhatsapp}
              >
                Открыть WhatsApp
              </Button>
              <Button variant="secondary" onClick={reset}>
                Новая бронь
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <MessageCircle className="size-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Следующий шаг
              </span>
            </div>
            <h3 className="text-lg font-semibold">Подтверждение</h3>
            <p className="text-sm text-muted-foreground">
              Мы подтвердим бронь и при необходимости предложим альтернативное
              время.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-primary" />
              Обычно отвечаем в течение 10 минут.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <Card className="bg-white/80">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <Clock3 className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Детали визита
            </span>
          </div>
          <h2 className="text-2xl font-semibold leading-tight">
            Выберите дату и время
          </h2>
          <p className="text-muted-foreground">
            Заполняйте форму, и мы свяжемся для подтверждения.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Дата</label>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Время</label>
            <Input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Длительность</label>
            <Select
              value={duration.toString()}
              onChange={(event) =>
                setDuration(Number(event.target.value))
              }
            >
              {[60, 90, 120, 150, 180].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes / 60} часа
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Гостей</label>
            <Input
              type="number"
              min={1}
              max={12}
              value={partySize}
              onChange={(event) =>
                setPartySize(Number(event.target.value))
              }
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">Карта столов</h3>
          <p className="text-sm text-muted-foreground">
            Выберите стол, который подходит по вместимости.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!tableOptions.length ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Карта зала еще не настроена. Выберите время и оставьте заявку —
              администратор подтвердит бронь вручную.
            </div>
          ) : (
            <>
              <div className="overflow-auto">
                <div
                  className="relative rounded-xl border border-dashed border-border bg-muted/30"
                  style={{
                    width: floorPlan?.canvasWidth ?? 800,
                    height: floorPlan?.canvasHeight ?? 480,
                    backgroundSize: "24px 24px",
                    backgroundImage:
                      "linear-gradient(to right, rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.2) 1px, transparent 1px)",
                  }}
                >
                  {tableOptions.map((table) => {
                    const isSelected =
                      table.number === selectedTableNumber;
                    const isDisabled = table.seats < partySize;
                    return (
                      <button
                        key={table.id ?? table.number}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedTableNumber(table.number)}
                        className={cn(
                          "absolute flex flex-col items-center justify-center rounded-lg border border-border bg-white/80 px-2 py-1 text-center text-xs shadow-sm transition",
                          isSelected && "border-primary bg-primary/10",
                          !isDisabled && "hover:border-primary/50",
                          isDisabled && "cursor-not-allowed opacity-50",
                        )}
                        style={{
                          left: table.x,
                          top: table.y,
                          width: table.width,
                          height: table.height,
                          transform: table.rotation
                            ? `rotate(${table.rotation}deg)`
                            : undefined,
                        }}
                      >
                        <span className="font-semibold">
                          Стол {table.number}
                        </span>
                        {table.label ? (
                          <span className="text-[10px] text-muted-foreground">
                            {table.label}
                          </span>
                        ) : null}
                        <span className="text-[10px] text-muted-foreground">
                          {table.seats} мест
                        </span>
                        {isDisabled ? (
                          <span className="text-[10px] font-semibold text-rose-600">
                            Мест нет
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                {tableOptions.map((table) => {
                  const isSelected =
                    table.number === selectedTableNumber;
                  const isDisabled = table.seats < partySize;
                  return (
                    <button
                      key={table.id ?? table.number}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedTableNumber(table.number)}
                      className={cn(
                        "flex flex-col gap-2 rounded-xl border border-border p-3 text-left transition",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "bg-muted/20 hover:border-primary/40",
                        isDisabled &&
                          "cursor-not-allowed opacity-50 hover:border-border",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          Стол {table.number}
                        </span>
                        <Badge tone="neutral">{table.seats} мест</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {table.label ?? "Без зоны"}
                      </span>
                      {isDisabled ? (
                        <span className="text-xs font-semibold text-rose-600">
                          Недостаточно мест
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">Контактные данные</h3>
          <p className="text-sm text-muted-foreground">
            Мы используем номер для подтверждения брони.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Имя</label>
            <Input name="name" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Телефон</label>
            <Input name="phone" required />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium">Комментарий</label>
            <Textarea name="comment" rows={3} />
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="p-4 text-sm font-semibold text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={submitting}>
          Отправить заявку
        </Button>
        <Button
          variant="secondary"
          href={hasWhatsapp ? `https://wa.me/${phoneDigits}` : undefined}
          disabled={!hasWhatsapp}
        >
          Написать в WhatsApp
        </Button>
      </div>
    </form>
  );
}
