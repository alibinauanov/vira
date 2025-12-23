"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

const bookings = [
  { guest: "Айгуль", seat: "2", time: "19:00", status: "Подтверждена" },
  { guest: "Алексей", seat: "6", time: "18:30", status: "Ожидает подтверждения" },
  { guest: "Нурлан", seat: "10", time: "21:00", status: "Подтверждена" },
  { guest: "Мила", seat: "12", time: "20:15", status: "Подтверждена" },
];

export default function DemoBookingPage() {
  const pricePerTable = 5000;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const maxCols = useMemo(() => Math.max(...seatLayout.map((seat) => seat.col + 1)), []);

  const seatStyles: Record<SeatDisplayStatus, { bg: string; border: string; text: string }> = {
    free: { bg: "bg-white", border: "border-slate-300", text: "text-slate-800" },
    booked: { bg: "bg-slate-200", border: "border-slate-300", text: "text-slate-600" },
    busy: { bg: "bg-slate-400", border: "border-slate-400", text: "text-white" },
    selected: { bg: "bg-blue-600", border: "border-blue-700", text: "text-white" },
  };

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== "free") return;
    setSelectedSeats((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id],
    );
  };

  const totalPrice = selectedSeats.length * pricePerTable;
  const selectedLabel = selectedSeats.length
    ? [...selectedSeats].sort((a, b) => Number(a) - Number(b)).join(", ")
    : "Нет";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.08em] text-slate-500">Бронь столов</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Свободные и занятые места</h1>
          <p className="text-slate-600 md:text-lg">
            Админ-панель бронирований: создавайте, переносите или отменяйте столы в реальном времени.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">Перенести бронь</Button>
          <Button variant="outline">Отменить бронь</Button>
          <Button>Создать бронь</Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="rounded-2xl bg-slate-50 p-4 md:p-5 shadow-inner">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-white border border-slate-300" aria-hidden="true" />
              Доступно
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-blue-600" aria-hidden="true" />
              Выбрано
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-slate-300 border border-slate-300" aria-hidden="true" />
              Бронь/занято
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center gap-4">
            <div className="w-full max-w-3xl">
              <div className="mx-auto w-full rounded-lg bg-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-[0.08em]">
                План зала
              </div>

              <div className="mt-4 w-full overflow-x-auto pb-2">
                <div
                  className="relative inline-grid gap-x-2 sm:gap-x-3 gap-y-1.5 sm:gap-y-2 rounded-xl bg-white p-3 sm:p-4 shadow-sm min-w-[520px] sm:min-w-[620px]"
                  style={{
                    gridTemplateColumns: `repeat(${maxCols}, minmax(44px, 1fr))`,
                    gridAutoRows: "70px",
                  }}
                >
                  <div className="pointer-events-none absolute inset-x-6 sm:inset-x-8 top-3 sm:top-4 flex justify-between text-[11px] uppercase tracking-[0.08em] text-slate-400 font-semibold">
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
                        className={`flex flex-col items-center justify-center rounded-xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${style.bg} ${style.border} ${style.text} ${
                          seat.status === "free" ? "hover:border-blue-400" : "cursor-not-allowed opacity-90"
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

            <div className="w-full max-w-4xl border-t border-slate-200 pt-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between text-sm md:text-base text-slate-700">
                <div>
                  Выбранные столы: <span className="font-semibold text-slate-900">{selectedLabel}</span>
                </div>
                <div className="font-semibold text-slate-900">Итого: {totalPrice.toLocaleString("ru-RU")} ₸</div>
              </div>
              <Button
                className="w-full md:w-auto rounded-full px-6"
                disabled={!selectedSeats.length}
              >
                {selectedSeats.length ? "Подтвердить бронь" : "Выберите столы"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.08em] text-slate-500">Брони</p>
            <h2 className="text-xl font-semibold text-slate-900">Последние заявки</h2>
          </div>
          <Button variant="outline" size="sm">
            Экспорт
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {bookings.map((booking) => (
            <div
              key={`${booking.guest}-${booking.seat}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{booking.guest}</p>
                <p className="text-xs text-slate-600">
                  Место {booking.seat} • {booking.time}
                </p>
              </div>
              <Badge variant="outline">{booking.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
