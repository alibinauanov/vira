"use client";

import { PhoneIcon, SearchIcon, SendIcon, VideoIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatPreview = {
  name: string;
  note?: string;
  time: string;
  unread?: number;
  channel: "wa" | "tg" | "sms";
};

type Message = {
  from: "client" | "manager";
  text: string;
  time: string;
  highlight?: boolean;
};

const chats: ChatPreview[] = [
  { name: "Алексей", note: "Рассылку посмотрю!", time: "10:18", unread: 2, channel: "wa" },
  { name: "Ольга", note: "Ок, отправляйте меню", time: "09:50", channel: "wa" },
  { name: "Данияр", note: "Жду ссылку", time: "09:22", channel: "tg" },
  { name: "Айгуль", note: "Показать рассылку", time: "Вчера", channel: "wa" },
  { name: "Сергей", note: "Спасибо, скоро придём", time: "Вчера", unread: 1, channel: "sms" },
  { name: "Нурлан", note: "Есть акция на субботу?", time: "Пт", channel: "wa" },
];

const messages: Message[] = [
  { from: "manager", text: "Привет! Это Vira. Запустили рассылку по VIP-гостям о бранче в субботу.", time: "10:06" },
  {
    from: "manager",
    text: "Отправили 1,243 сообщения, доставлено 1,201. Хотите добавить ещё персональный купон?",
    time: "10:07",
    highlight: true,
  },
  { from: "client", text: "Да, нужно +10% гостям, у кого было 2 визита за месяц.", time: "10:08" },
  { from: "manager", text: "Готово. Перезапускаю рассылку по сегменту “частые гости”.", time: "10:09" },
  { from: "manager", text: "Текст: «Ждём на бранче в субботу с -10% по промокоду BRUNCH10»", time: "10:09" },
  { from: "client", text: "Ок. Поставьте отправку на 12:00 и автонапоминание за час.", time: "10:10" },
  { from: "manager", text: "Запланировано. Отчет отправлю после отправки.", time: "10:11" },
  { from: "client", text: "Спасибо!", time: "10:11" },
];

export default function DemoMailingsPage() {
  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] gap-4">
      <aside className="w-full lg:max-w-xs rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">Чаты</p>
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              Рассылки
            </Badge>
          </div>
          <div className="mt-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Поиск по клиентам" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {chats.map((chat) => (
            <button
              key={chat.name}
              type="button"
              className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                {chat.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900 truncate">{chat.name}</p>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{chat.time}</span>
                </div>
                <p className="text-sm text-slate-600 truncate">{chat.note}</p>
              </div>
              {chat.unread ? (
                <span className="min-w-[22px] rounded-full bg-emerald-500 px-2 py-0.5 text-center text-xs font-semibold text-white">
                  {chat.unread}
                </span>
              ) : null}
              <span
                className={`h-2 w-2 rounded-full ${
                  chat.channel === "wa"
                    ? "bg-green-500"
                    : chat.channel === "tg"
                      ? "bg-sky-500"
                      : "bg-amber-500"
                }`}
              />
            </button>
          ))}
        </div>
      </aside>

      <section className="flex-1 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden min-h-[420px]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
              V
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Алексей</p>
              <p className="text-sm text-slate-500">онлайн • VIP гость</p>
            </div>
          </div>
          <div />
        </div>

        <div className="flex-1 bg-slate-50/70 px-5 py-6 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.time}-${idx}`}
                className={`flex ${msg.from === "manager" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.from === "manager"
                      ? "bg-white border border-slate-200 text-slate-900"
                      : "bg-emerald-500 text-white"
                  } ${msg.highlight ? "ring-2 ring-amber-400/70" : ""}`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div
                    className={`mt-1 text-xs ${
                      msg.from === "manager" ? "text-slate-500" : "text-white/80"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            <Input placeholder="Написать сообщение клиенту..." className="w-full" />
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="border-slate-300 text-slate-700">
                Шаблон рассылки
              </Badge>
              <Button size="icon" className="rounded-full" aria-label="Отправить">
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
