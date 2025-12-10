import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SeatStatus = "free" | "booked" | "busy";

type Seat = {
  id: string;
  status: SeatStatus;
  name: string;
  time?: string;
  row: number;
  col: number;
};

const seatLayout: Seat[] = [
  { id: "A1", status: "free", name: "Окно", row: 1, col: 1 },
  { id: "A2", status: "booked", name: "Окно", time: "19:00", row: 1, col: 3 },
  { id: "A3", status: "free", name: "Диван", row: 1, col: 5 },
  { id: "A4", status: "busy", name: "Бар", row: 1, col: 7 },
  { id: "A5", status: "booked", name: "Бар", time: "20:00", row: 1, col: 9 },
  { id: "B1", status: "busy", name: "Центр", row: 3, col: 2 },
  { id: "B2", status: "booked", name: "Центр", time: "18:30", row: 3, col: 4 },
  { id: "B3", status: "free", name: "Центр", row: 3, col: 6 },
  { id: "B4", status: "free", name: "Центр", row: 3, col: 8 },
  { id: "B5", status: "booked", name: "Центр", time: "21:00", row: 3, col: 10 },
  { id: "C1", status: "free", name: "У стены", row: 5, col: 2 },
  { id: "C2", status: "busy", name: "У стены", row: 5, col: 4 },
  { id: "C3", status: "free", name: "У стены", row: 5, col: 6 },
  { id: "C4", status: "booked", name: "У стены", time: "19:30", row: 5, col: 8 },
  { id: "C5", status: "free", name: "У стены", row: 5, col: 10 },
];

const bookings = [
  { guest: "Айгуль", seat: "A2", time: "19:00", status: "Подтверждена" },
  { guest: "Алексей", seat: "B2", time: "18:30", status: "Ожидает подтверждения" },
  { guest: "Нурлан", seat: "B5", time: "21:00", status: "Подтверждена" },
  { guest: "Мила", seat: "C4", time: "19:30", status: "Подтверждена" },
];

const statusStyles: Record<SeatStatus, { bg: string; ring: string; label: string }> = {
  free: { bg: "bg-emerald-50", ring: "ring-emerald-200", label: "Свободно" },
  booked: { bg: "bg-amber-50", ring: "ring-amber-200", label: "Забронировано" },
  busy: { bg: "bg-rose-50", ring: "ring-rose-200", label: "Занято" },
};

export default function DemoBookingPage() {
  const total = seatLayout.length;
  const free = seatLayout.filter((s) => s.status === "free").length;
  const booked = seatLayout.filter((s) => s.status === "booked").length;
  const busy = seatLayout.filter((s) => s.status === "busy").length;

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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Свободно: {free}</Badge>
          <Badge className="bg-amber-500 text-white hover:bg-amber-600">Забронировано: {booked}</Badge>
          <Badge className="bg-rose-500 text-white hover:bg-rose-600">Занято: {busy}</Badge>
          <span className="text-slate-500">Всего мест: {total}</span>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-12 gap-4 rounded-2xl bg-slate-50 p-4">
            {seatLayout.map((seat) => {
              const style = statusStyles[seat.status];
              return (
                <div
                  key={seat.id}
                  className={`flex h-16 w-full min-w-[70px] flex-col items-center justify-center rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 ring-2 ${style.bg} ${style.ring}`}
                  style={{ gridColumn: `${seat.col} / span 2`, gridRow: `${seat.row}` }}
                >
                  <span>{seat.id}</span>
                  <span className="text-xs text-slate-500">{seat.time || seat.name}</span>
                </div>
              );
            })}
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
