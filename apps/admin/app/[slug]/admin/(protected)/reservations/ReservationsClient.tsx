"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PencilLine,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";

import {
  type ReservationDTO,
  type ReservationStatus,
} from "@vira/shared";
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
import { formatTime } from "@/lib/utils";

type Props = {
  slug: string;
  initialDate?: string;
  initialReservations: ReservationDTO[];
};

type EditorValues = {
  id?: number;
  date: string;
  time: string;
  durationMinutes: number;
  tableLabel: string;
  tableSeats: number;
  partySize: number;
  name: string;
  phone: string;
  comment: string;
  status: ReservationStatus;
};

const statusTone: Record<
  ReservationStatus,
  "neutral" | "success" | "warning" | "error"
> = {
  new: "neutral",
  confirmed: "success",
  cancelled: "error",
};

export function ReservationsClient({
  slug,
  initialDate,
  initialReservations,
}: Props) {
  const [date, setDate] = useState(
    initialDate ?? "",
  );
  const [reservations, setReservations] =
    useState<ReservationDTO[]>(initialReservations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorValues | null>(null);
  const [saving, setSaving] = useState(false);

  const refreshReservations = async (params?: { date?: string }) => {
    const effectiveDate = params?.date ?? date;
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        includeCancelled: "true",
      });
      if (effectiveDate) query.set("date", effectiveDate);
      const res = await fetch(
        `/api/${slug}/reservations?${query.toString()}`,
        { cache: "no-store" },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось загрузить бронирования.");
      }
      setReservations(body.reservations ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось загрузить бронирования.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const counts = useMemo(() => {
    return reservations.reduce(
      (acc, res) => {
        acc.total += 1;
        acc[res.status] = (acc[res.status] || 0) + 1;
        return acc;
      },
      { total: 0, new: 0, confirmed: 0, cancelled: 0 } as Record<
        string,
        number
      >,
    );
  }, [reservations]);

  const openEditor = (reservation?: ReservationDTO) => {
    const baseDate = date || new Date().toISOString().slice(0, 10);
    const startAt = reservation
      ? new Date(reservation.startAt)
      : new Date(`${baseDate}T${new Date().toISOString().slice(11, 16)}`);
    const endAt = reservation
      ? new Date(reservation.endAt)
      : new Date(startAt.getTime() + 2 * 60 * 60 * 1000);

    const durationMinutes = Math.max(
      30,
      Math.round((endAt.getTime() - startAt.getTime()) / 60000),
    );

    setEditor({
      id: reservation?.id,
      date: startAt.toISOString().slice(0, 10),
      time: startAt.toISOString().slice(11, 16),
      durationMinutes,
      tableLabel: reservation?.tableLabel ?? "A1",
      tableSeats: reservation?.tableSeats ?? 2,
      partySize: reservation?.partySize ?? 2,
      name: reservation?.name ?? "",
      phone: reservation?.phone ?? "",
      comment: reservation?.comment ?? "",
      status: reservation?.status ?? "confirmed",
    });
  };

  const handleDelete = async (reservation: ReservationDTO) => {
    const confirmed = window.confirm(
      `Удалить бронь для ${reservation.name}?`,
    );
    if (!confirmed) return;
    try {
      const res = await fetch(
        `/api/${slug}/reservations/${reservation.id}`,
        { method: "DELETE" },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось удалить бронь.");
      }
      setReservations((prev) =>
        prev.filter((item) => item.id !== reservation.id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить бронь.",
      );
    }
  };

  const handleSave = async (values: EditorValues) => {
    setSaving(true);
    setError(null);

    const payload = {
      tableLabel: values.tableLabel,
      tableSeats: values.tableSeats,
      partySize: values.partySize,
      startAt: new Date(`${values.date}T${values.time}:00`).toISOString(),
      durationMinutes: values.durationMinutes,
      name: values.name,
      phone: values.phone,
      comment: values.comment || undefined,
      status: values.status,
    };

    try {
      const isNew = !values.id;
      const endpoint = isNew
        ? `/api/${slug}/reservations`
        : `/api/${slug}/reservations/${values.id}`;
      const res = await fetch(endpoint, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось сохранить бронь.");
      }
      setEditor(null);
      await refreshReservations({ date });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить бронь.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Бронирования
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Доска бронирований
          </h1>
          <p className="text-muted-foreground">
            Единый список заявок на бронирование для ресторана.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => void refreshReservations()}
            loading={loading}
          >
            <RefreshCcw className="size-4" />
            Обновить
          </Button>
          <Button onClick={() => openEditor()}>
            <Plus className="size-4" />
            Добавить бронь
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Всего" value={counts.total} />
        <StatCard title="Новые" value={counts.new} />
        <StatCard title="Подтверждены" value={counts.confirmed} />
        <StatCard title="Отменены" value={counts.cancelled} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="w-full space-y-4 lg:max-w-sm">
          <Card className="bg-white/80">
            <CardHeader className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Фильтры
                </p>
                <p className="text-lg font-semibold leading-tight">Дата</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Выберите дату, чтобы посмотреть расписание.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Дата</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  placeholder="Все даты"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => void refreshReservations()}
                  loading={loading}
                >
                  <RefreshCcw className="size-4" />
                  Обновить
                </Button>
                <Button onClick={() => openEditor()}>
                  <Plus className="size-4" />
                  Новая бронь
                </Button>
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

          {loading ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">
                    Загружаем бронирования...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </aside>

        <section className="flex-1 space-y-4">
          <BookingListPanel
            reservations={reservations}
            date={date}
            onEdit={(res) => openEditor(res)}
            onDelete={handleDelete}
          />
        </section>
      </div>

      {editor ? (
        <EditorModal
          values={editor}
          onClose={() => setEditor(null)}
          onSave={handleSave}
          saving={saving}
        />
      ) : null}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="bg-white/80">
      <CardHeader className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardHeader>
    </Card>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const labels: Record<ReservationStatus, string> = {
    new: "Новая",
    confirmed: "Подтверждена",
    cancelled: "Отменена",
  };
  return <Badge tone={statusTone[status]}>{labels[status]}</Badge>;
}

function BookingListPanel({
  reservations,
  date,
  onEdit,
  onDelete,
}: {
  reservations: ReservationDTO[];
  date: string;
  onEdit: (res: ReservationDTO) => void;
  onDelete: (res: ReservationDTO) => void;
}) {
  const sorted = reservations
    .slice()
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

  return (
    <Card className="bg-white/90">
      <CardHeader className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Бронирования
            </p>
            <p className="text-lg font-semibold leading-tight">
              {date ? `Расписание на ${date}` : "Все бронирования"}
            </p>
          </div>
          <Badge tone="neutral">{sorted.length} всего</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Быстрый список заявок. Нажмите, чтобы редактировать или удалить.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {sorted.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            На эту дату нет бронирований.
          </div>
        ) : (
          sorted.map((res) => {
            const start = new Date(res.startAt);
            const end = new Date(res.endAt);
            return (
              <div
                key={res.id}
                className="rounded-lg border border-border bg-white/80 p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {formatTime(start)} – {formatTime(end)}
                    </div>
                    <StatusBadge status={res.status} />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => onEdit(res)}
                    >
                      <PencilLine className="size-4" />
                      Редактировать
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => onDelete(res)}
                    >
                      <Trash2 className="size-4" />
                      Удалить
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-base font-semibold">
                  {res.name} · {res.partySize} гостей
                </p>
                <p className="text-sm text-muted-foreground">
                  Стол {res.tableLabel ?? "—"} ·{" "}
                  {res.tableSeats ?? "?"} мест · {res.phone}
                </p>
                {res.comment ? (
                  <p className="text-sm text-muted-foreground">
                    Комментарий: {res.comment}
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function EditorModal({
  values,
  onClose,
  onSave,
  saving,
}: {
  values: EditorValues;
  onClose: () => void;
  onSave: (values: EditorValues) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState<EditorValues>(values);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setForm(values);
  }, [values]);

  const handleChange = (
    key: keyof EditorValues,
    value: string | number | ReservationStatus,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    if (!form.tableLabel || !form.tableSeats) {
      setLocalError("Укажите стол и количество мест.");
      return;
    }
    if (!form.name || !form.phone) {
      setLocalError("Имя и телефон обязательны.");
      return;
    }
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {form.id ? "Редактировать бронь" : "Новая бронь"}
            </p>
            <p className="text-sm text-muted-foreground">
              Обновите данные гостя и время визита.
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
        <form className="grid gap-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Дата</label>
              <Input
                type="date"
                value={form.date}
                onChange={(event) =>
                  handleChange("date", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Начало</label>
              <Input
                type="time"
                value={form.time}
                onChange={(event) =>
                  handleChange("time", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Длительность</label>
              <Select
                value={form.durationMinutes.toString()}
                onChange={(event) =>
                  handleChange("durationMinutes", Number(event.target.value))
                }
              >
                {[60, 90, 120, 150, 180].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes / 60} часа
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Стол</label>
              <Input
                value={form.tableLabel}
                onChange={(event) =>
                  handleChange("tableLabel", event.target.value)
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Мест</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={form.tableSeats}
                onChange={(event) =>
                  handleChange("tableSeats", Number(event.target.value))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Гостей</label>
              <Input
                type="number"
                min={1}
                max={12}
                value={form.partySize}
                onChange={(event) =>
                  handleChange("partySize", Number(event.target.value))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Статус</label>
              <Select
                value={form.status}
                onChange={(event) =>
                  handleChange(
                    "status",
                    event.target.value as ReservationStatus,
                  )
                }
              >
                <option value="new">Новая</option>
                <option value="confirmed">Подтверждена</option>
                <option value="cancelled">Отменена</option>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Телефон</label>
              <Input
                value={form.phone}
                onChange={(event) =>
                  handleChange("phone", event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Имя</label>
              <Input
                value={form.name}
                onChange={(event) =>
                  handleChange("name", event.target.value)
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Комментарий</label>
              <Textarea
                rows={2}
                value={form.comment}
                onChange={(event) =>
                  handleChange("comment", event.target.value)
                }
              />
            </div>
          </div>

          {localError ? (
            <p className="text-sm font-semibold text-destructive">
              {localError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="submit" loading={saving}>
              Сохранить
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
