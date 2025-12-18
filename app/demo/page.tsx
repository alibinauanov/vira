"use client";

import { useMemo, useState } from "react";
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
  { name: "Жанна", note: "Что у вас по бранчам?", time: "10:18", unread: 2, channel: "wa" },
  { name: "Карина", note: "Можно забронировать на двоих?", time: "09:50", channel: "wa" },
  { name: "Ермек", note: "Есть детское меню?", time: "09:22", channel: "tg" },
  { name: "Ольга", note: "Автонaпоминание о визите", time: "Вчера", channel: "wa" },
  { name: "Данияр", note: "Новое меню: отправили рассылку", time: "Вчера", unread: 1, channel: "sms" },
];

const messagesByChat: Record<string, Message[]> = {
  Жанна: [
    { from: "manager", text: "Привет! Это Vira. Подскажите, интересует бранч или ужин?", time: "10:16" },
    { from: "client", text: "Бранч, что в меню и во сколько начинаете?", time: "10:17" },
    { from: "manager", text: "Старт в 11:00, сет из 6 блюд и безлимит кофе за 8 900 ₸. Забронировать стол у окна?", time: "10:17" },
  ],
  Карина: [
    { from: "client", text: "Можно забронировать стол на двоих на сегодня 19:30?", time: "09:48" },
    { from: "manager", text: "Да, доступны столы 5 и 9. Предпочтения по зоне?", time: "09:49" },
    { from: "client", text: "Ближе к окну, пожалуйста.", time: "09:49" },
  ],
  Ермек: [
    { from: "client", text: "Привет! Есть детское меню и стульчики?", time: "09:20" },
    { from: "manager", text: "Да, детское меню есть, стульчики тоже. Нужен стол на сегодня?", time: "09:21" },
    { from: "client", text: "Да, на 4 человек в 18:00.", time: "09:21" },
  ],
  Ольга: [
    { from: "manager", text: "Добрый день! Напоминаем о вашем бронировании на завтра в 20:00. Подтвердить визит?", time: "Вчера" },
    { from: "client", text: "Да, будем вдвоём.", time: "Вчера" },
    { from: "manager", text: "Отлично, стол 6 за вами. Напомнить за час?", time: "Вчера" },
  ],
  Данияр: [
    { from: "manager", text: "Запустили рассылку: новое меню с локальной рыбой. Хотите посмотреть?", time: "Вчера" },
    { from: "client", text: "Да, пришлите топ-3 блюда.", time: "Вчера" },
    {
      from: "manager",
      text: "Отправили 3 рекомендации и купон -10% до воскресенья. Показать аналитику по доставке?",
      time: "Вчера",
      highlight: true,
    },
  ],
};

export default function DemoMailingsPage() {
  const [activeChat, setActiveChat] = useState<ChatPreview>(chats[0]);
  const messages = useMemo(
    () => messagesByChat[activeChat.name] ?? [],
    [activeChat.name],
  );

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
          {chats.map((chat) => {
            const isActive = chat.name === activeChat.name;
            return (
            <button
              key={chat.name}
              type="button"
              onClick={() => setActiveChat(chat)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 ${
                isActive ? "bg-slate-100" : ""
              }`}
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
            );
          })}
        </div>
      </aside>

      <section className="flex-1 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden min-h-[420px]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
              V
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{activeChat.name}</p>
              <p className="text-sm text-slate-500">
                {activeChat.channel === "wa"
                  ? "WhatsApp"
                  : activeChat.channel === "tg"
                    ? "Telegram"
                    : "SMS"}{" "}
                • клиент
              </p>
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
