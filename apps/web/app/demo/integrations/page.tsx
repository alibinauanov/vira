import { CheckCircle2Icon, Plug2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const integrations = [
  { name: "iiko", desc: "POS и складской учет", status: "Подключено" },
  { name: "CRM", desc: "Клиентские данные и сегменты", status: "Подключено" },
  { name: "WhatsApp Business", desc: "Мессенджер для рассылок и чатов", status: "Подключено" },
  { name: "Rosta", desc: "Лояльность и маркетинг", status: "Подключено" },
  { name: "Paloma", desc: "Программа лояльности", status: "Подключено" },
  { name: "Umag", desc: "Касса и склад", status: "Подключено" },
];

export default function DemoIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.08em] text-slate-500">Интеграции</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Подключенные системы</h1>
          <p className="text-slate-600 md:text-lg max-w-2xl">
            POS, CRM и каналы коммуникации, через которые Vira отправляет рассылки, принимает брони и синхронизирует
            гостей.
          </p>
        </div>
        <Badge tone="neutral" className="border-slate-300 text-slate-700">
          Все подключены
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {integrations.map((item) => (
          <Card
            key={item.name}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Plug2Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <CheckCircle2Icon className="h-4 w-4" />
              {item.status}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
