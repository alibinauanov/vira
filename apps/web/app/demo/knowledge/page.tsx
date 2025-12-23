import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type KnowledgeRow = {
  section: string;
  detail?: string;
  updated: string;
  items?: { name: string; price: string }[];
};

const knowledgeEntries: KnowledgeRow[] = [
  {
    section: "Меню",
    detail: "Бранч-сет по выходным, авторские коктейли, вегетарианские блюда. Аллергены отмечены.",
    updated: "Сегодня, 10:00",
  },
  {
    section: "Меню • Закуски",
    items: [
      { name: "Брускетта с лососем", price: "3 200 ₸" },
      { name: "Сырная тарелка", price: "4 500 ₸" },
      { name: "Хумус с питой", price: "2 300 ₸" },
      { name: "Тартар из тунца", price: "4 800 ₸" },
      { name: "Креветки в темпуре", price: "4 900 ₸" },
    ],
    updated: "Сегодня, 10:05",
  },
  {
    section: "Меню • Горячее",
    items: [
      { name: "Стейк рибай 300 г", price: "9 500 ₸" },
      { name: "Лазанья", price: "4 200 ₸" },
      { name: "Паста карбонара", price: "4 800 ₸" },
      { name: "Ризотто с грибами", price: "4 600 ₸" },
      { name: "Филе лосося", price: "8 400 ₸" },
      { name: "Бургер фирменный", price: "4 900 ₸" },
    ],
    updated: "Сегодня, 10:05",
  },
  {
    section: "Меню • Напитки",
    items: [
      { name: "Фирменный латте", price: "1 600 ₸" },
      { name: "Раф с фисташкой", price: "1 900 ₸" },
      { name: "Матча латте", price: "2 100 ₸" },
      { name: "Авторские коктейли", price: "от 3 500 ₸" },
      { name: "Домашний лимонад", price: "1 800 ₸" },
      { name: "Свежевыжатый сок", price: "2 400 ₸" },
    ],
    updated: "Сегодня, 10:05",
  },
  {
    section: "График работы",
    detail: "Пн–Чт: 10:00–23:00, Пт–Сб: 10:00–01:00, Вс: 11:00–22:00.",
    updated: "Сегодня, 09:30",
  },
  {
    section: "Доставка и самовывоз",
    detail: "Доставка через курьеров, самовывоз со скидкой 10%. Время готовности: 25–35 минут.",
    updated: "Вчера, 18:10",
  },
  {
    section: "Бронь и депозит",
    detail: "Бронь через WhatsApp/сайт. Депозит на группу 6+ гостей — 10 000 ₸, удерживается до визита.",
    updated: "Вчера, 14:45",
  },
  {
    section: "Акции",
    detail: "«2 по цене 1» на кофе до 12:00; скидка 15% на бранч для постоянных гостей по промокоду.",
    updated: "Пн, 11:20",
  },
  {
    section: "Контакты",
    detail: "Адрес: Абая 12. Телефон: +7 (707) 173-85-30. WhatsApp: wa.me/77071738530.",
    updated: "Пн, 09:00",
  },
];

export default function DemoKnowledgePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.08em] text-slate-500">База знаний</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Информация для ответов и скриптов</h1>
          <p className="text-slate-600 md:text-lg">
            Меню, график работы, условия доставки и броней — всё, что агент использует, чтобы отвечать гостям.
          </p>
        </div>
        <div>
          <Button variant="outline">Редактировать</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
        <Table>
          <TableCaption>Данные из базы знаний ресторана.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Раздел</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="text-right w-[140px]">Обновлено</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {knowledgeEntries.map((row) => (
              <TableRow key={row.section}>
                <TableCell className="font-semibold text-slate-900 align-top">{row.section}</TableCell>
                <TableCell className="text-slate-700">
                  {row.items ? (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {row.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-slate-900">{item.name}</span>
                          <span className="text-slate-600">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>{row.detail}</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-slate-500 align-top">{row.updated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
