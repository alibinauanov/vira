"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SeatStatus = "free" | "booked" | "busy";
type SeatDisplayStatus = SeatStatus | "selected";

type Seat = {
  id: string;
  status: SeatStatus;
  area: string;
  capacity: number;
  time?: string;
  row: number;
  col: number;
};

const seatLayout: Seat[] = [
  { id: "1", status: "free", area: "У окна", capacity: 2, row: 1, col: 2 },
  { id: "2", status: "booked", area: "У окна", capacity: 2, time: "19:00", row: 1, col: 6 },
  { id: "3", status: "free", area: "У окна", capacity: 4, row: 1, col: 10 },
  { id: "4", status: "busy", area: "У окна", capacity: 4, time: "20:00", row: 2, col: 4 },
  { id: "5", status: "free", area: "Центр", capacity: 2, row: 2, col: 8 },
  { id: "6", status: "booked", area: "Центр", capacity: 2, time: "19:30", row: 2, col: 11 },
  { id: "7", status: "busy", area: "Центр", capacity: 4, time: "18:45", row: 4, col: 3 },
  { id: "8", status: "free", area: "Центр", capacity: 4, row: 4, col: 6 },
  { id: "9", status: "free", area: "Центр", capacity: 2, row: 4, col: 9 },
  { id: "10", status: "booked", area: "Центр", capacity: 4, time: "21:00", row: 4, col: 12 },
  { id: "11", status: "free", area: "У стены", capacity: 2, row: 6, col: 2 },
  { id: "12", status: "booked", area: "У стены", capacity: 4, time: "20:15", row: 6, col: 5 },
  { id: "13", status: "free", area: "У стены", capacity: 4, row: 6, col: 8 },
  { id: "14", status: "busy", area: "У стены", capacity: 2, time: "18:00", row: 6, col: 11 },
  { id: "15", status: "free", area: "Терраса", capacity: 2, row: 8, col: 3 },
  { id: "16", status: "free", area: "Терраса", capacity: 4, row: 8, col: 6 },
  { id: "17", status: "booked", area: "Терраса", capacity: 2, time: "21:30", row: 8, col: 9 },
  { id: "18", status: "free", area: "Терраса", capacity: 4, row: 8, col: 12 },
];

export default function ClientReservePage() {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", time: "", people: "" });

  const maxCols = useMemo(() => Math.max(...seatLayout.map((seat) => seat.col + 1)), []);

  const seatStyles: Record<SeatDisplayStatus, { bg: string; border: string; text: string }> = {
    free: { bg: "bg-white", border: "border-slate-200", text: "text-slate-900" },
    booked: { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-500" },
    busy: { bg: "bg-slate-300", border: "border-slate-300", text: "text-white" },
    selected: { bg: "bg-slate-900", border: "border-slate-900", text: "text-white" },
  };

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== "free") return;
    setSelectedSeats((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id],
    );
  };

  const handleInput = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const disabledConfirm =
    !form.name.trim() || !form.phone.trim() || !form.time.trim() || !form.people.trim() || !selectedSeats.length;

  const selectedLabel = selectedSeats.length
    ? [...selectedSeats].sort((a, b) => Number(a) - Number(b)).join(", ")
    : "ничего не выбрано";

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Забронировать стол</h1>
          <p className="text-slate-600">
            Заполните данные и выберите стол. Мы подтвердим бронь в ответном сообщении.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-800">Имя</span>
              <Input
                placeholder="Ваше имя"
                value={form.name}
                onChange={handleInput("name")}
                className="h-11 rounded-xl"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-800">Телефон</span>
              <Input
                placeholder="+7"
                value={form.phone}
                onChange={handleInput("phone")}
                className="h-11 rounded-xl"
                inputMode="tel"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-800">Время визита</span>
              <Input
                type="time"
                value={form.time}
                onChange={handleInput("time")}
                className="h-11 rounded-xl"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-800">Количество гостей</span>
              <Input
                type="number"
                min={1}
                max={8}
                placeholder="2"
                value={form.people}
                onChange={handleInput("people")}
                className="h-11 rounded-xl"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-800">Выбор столика</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-4 w-4 rounded bg-white border border-slate-200" />
                  Свободно
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-4 w-4 rounded bg-slate-900" />
                  Выбрано
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-4 w-4 rounded bg-slate-200 border border-slate-200" />
                  Недоступно
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <div
                className="relative mx-auto inline-grid min-w-[520px] gap-x-2 gap-y-2 rounded-2xl bg-slate-50 p-4 shadow-inner sm:min-w-[620px] sm:p-5"
                style={{
                  gridTemplateColumns: `repeat(${maxCols}, minmax(44px, 1fr))`,
                  gridAutoRows: "70px",
                }}
              >
                <div className="pointer-events-none absolute inset-x-6 top-3 flex justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:inset-x-8 sm:top-4">
                  <span>Окна</span>
                  <span>Бар</span>
                </div>

                {seatLayout.map((seat) => {
                  const isSelected = selectedSeats.includes(seat.id);
                  const visualStatus: SeatDisplayStatus = isSelected ? "selected" : seat.status;
                  const style = seatStyles[visualStatus];

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => toggleSeat(seat)}
                      className={`flex flex-col items-center justify-center rounded-xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/40 ${style.bg} ${style.border} ${style.text} ${
                        seat.status === "free" ? "hover:border-slate-400" : "cursor-not-allowed opacity-80"
                      }`}
                      style={{ gridColumn: `${seat.col} / span 2`, gridRow: `${seat.row}` }}
                      aria-label={`Стол ${seat.id}. ${seat.status === "free" ? "Свободен" : "Недоступен"}`}
                    >
                      <span>Стол {seat.id}</span>
                      <span className="text-[11px] text-slate-600 text-center">
                        {seat.time || `${seat.area} • ${seat.capacity} чел.`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Выбрано: <span className="font-semibold text-slate-900">{selectedLabel}</span>
            </p>
            <Button
              className="h-12 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
              disabled={disabledConfirm}
            >
              Подтвердить бронь
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
