"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menu: MenuSection[] = [
  {
    title: "Закуски",
    items: [
      { id: "bruschetta", name: "Брускетта с лососем", price: 3200, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=640&q=80" },
      { id: "cheese-plate", name: "Сырная тарелка", price: 4500, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80" },
      { id: "hummus", name: "Хумус с питой", price: 2300, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80" },
      { id: "tuna-tartare", name: "Тартар из тунца", price: 4800, image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=640&q=80" },
      { id: "tempura", name: "Креветки в темпуре", price: 4900, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=640&q=80" },
    ],
  },
  {
    title: "Горячее",
    items: [
      { id: "ribeye", name: "Стейк рибай 300 г", price: 9500, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80" },
      { id: "lasagna", name: "Лазанья", price: 4200, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=640&q=80" },
      { id: "carbonara", name: "Паста карбонара", price: 4800, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80" },
      { id: "risotto", name: "Ризотто с грибами", price: 4600, image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=640&q=80" },
      { id: "salmon", name: "Филе лосося", price: 8400, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80" },
      { id: "burger", name: "Бургер фирменный", price: 4900, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=640&q=80" },
    ],
  },
  {
    title: "Напитки",
    items: [
      { id: "latte", name: "Фирменный латте", price: 1600, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&q=80" },
      { id: "raf", name: "Раф с фисташкой", price: 1900, image: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=640&q=80" },
      { id: "matcha", name: "Матча латте", price: 2100, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=640&q=80" },
      { id: "cocktail", name: "Авторские коктейли", price: 3500, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80" },
      { id: "lemonade", name: "Домашний лимонад", price: 1800, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80" },
      { id: "juice", name: "Свежевыжатый сок", price: 2400, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80" },
    ],
  },
];

export default function OrderPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"menu" | "summary">("menu");

  const flatItems = useMemo(() => menu.flatMap((section) => section.items), []);

  const selectedItems = useMemo(
    () => flatItems.filter((item) => (quantities[item.id] ?? 0) > 0),
    [flatItems, quantities],
  );

  const total = useMemo(
    () =>
      selectedItems.reduce((sum, item) => {
        const qty = quantities[item.id] ?? 0;
        return sum + item.price * qty;
      }, 0),
    [quantities, selectedItems],
  );

  const formatPrice = (value: number) => `${value.toLocaleString("ru-RU")} ₸`;

  const changeQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      if (!next) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
          {step === "menu" ? "Сделать заказ" : "Итог заказа"}
        </h1>
        <p className="text-slate-600 md:text-lg">
          Выберите позиции из меню, подтвердите сумму и отправьте заказ.
        </p>
      </div>

      {step === "menu" ? (
        <div className="space-y-5">
          {menu.map((section) => (
            <div key={section.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                <span className="text-xs uppercase tracking-[0.08em] text-slate-500">Меню</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => {
                  const qty = quantities[item.id] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <p className="text-sm uppercase tracking-[0.08em] text-slate-500">
                              {section.title}
                            </p>
                            <p className="text-base font-semibold text-slate-900">{item.name}</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{formatPrice(item.price)}</span>
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              onClick={() => changeQty(item.id, -1)}
                              className="rounded-full"
                              aria-label={`Уменьшить ${item.name}`}
                            >
                              –
                            </Button>
                            <span className="w-8 text-center text-sm font-semibold text-slate-900">{qty}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              onClick={() => changeQty(item.id, 1)}
                              className="rounded-full"
                              aria-label={`Добавить ${item.name}`}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            type="button"
                            className="h-9 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                            onClick={() => changeQty(item.id, 1)}
                          >
                            Добавить
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.08em] text-slate-500">Итого</span>
              <span className="text-xl font-semibold text-slate-900">{formatPrice(total)}</span>
            </div>
            <Button
              className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
              disabled={!selectedItems.length}
              onClick={() => setStep("summary")}
            >
              Перейти к итогам
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Вы выбрали</h2>
            <Button variant="outline" size="sm" onClick={() => setStep("menu")}>
              Изменить
            </Button>
          </div>

          <div className="space-y-3">
            {selectedItems.map((item) => {
              const qty = quantities[item.id] ?? 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">x{qty}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">{formatPrice(item.price * qty)}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
            <span className="text-base font-semibold text-slate-900">Итого</span>
            <span className="text-xl font-semibold text-slate-900">{formatPrice(total)}</span>
          </div>

          <Button className="h-12 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
            Оформить заказ
          </Button>
        </div>
      )}
    </div>
  );
}
