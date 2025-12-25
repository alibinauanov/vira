import { PlusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Subscription = {
  name: string;
  type: string;
  status: "Активна" | "Пауза" | "Отменена";
  amount: string;
};

const subscriptions: Subscription[] = [
  { name: "Алексей Орлов", type: "Еженедельный бранч", status: "Активна", amount: "12 000 ₸" },
  { name: "Ольга Садыкова", type: "Кофейная подписка", status: "Активна", amount: "8 500 ₸" },
  { name: "Данияр Ахметов", type: "VIP дегустации", status: "Отменена", amount: "25 000 ₸" },
  { name: "Айгуль Мусаева", type: "Обеденная", status: "Активна", amount: "15 000 ₸" },
  { name: "Сергей Ким", type: "Вечерний сет", status: "Отменена", amount: "—" },
];

function statusBadge(status: Subscription["status"]) {
  if (status === "Активна") return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Активна</Badge>;
  if (status === "Пауза") return <Badge tone="neutral">Пауза</Badge>;
  return <Badge tone="neutral" className="text-slate-500 border-slate-200">Отменена</Badge>;
}

export default function DemoSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.08em] text-slate-500">Подписки</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Клиенты с активными подписками</h1>
          <p className="text-slate-600 md:text-lg">
            Список гостей, которые оформили подписки на блюда и сервисы вашего заведения.
          </p>
        </div>
        <Button className="self-start md:self-center rounded-full px-5">
          <PlusIcon className="h-4 w-4" />
          Создать подписку
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
        <Table>
          <TableCaption>Обновлено автоматически из CRM.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Имя</TableHead>
              <TableHead>Тип подписки</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Сумма / цикл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.name}>
                <TableCell className="font-medium">{sub.name}</TableCell>
                <TableCell>{sub.type}</TableCell>
                <TableCell>{statusBadge(sub.status)}</TableCell>
                <TableCell className="text-right">{sub.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
