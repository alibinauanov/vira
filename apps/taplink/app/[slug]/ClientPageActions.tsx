"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type ButtonType =
  | "BOOKING"
  | "ORDER"
  | "WHATSAPP"
  | "KASPI"
  | "EXTERNAL_URL";

type ClientButton = {
  id: string;
  text: string;
  color: string;
  type: ButtonType;
  url?: string | null;
  order: number;
  enabled: boolean;
};

type Props = {
  slug: string;
  buttons: ClientButton[];
  integrations: {
    orderUrl?: string | null;
    whatsappPhone?: string | null;
    kaspiUrl?: string | null;
  };
};

const sanitizePhone = (value?: string | null) =>
  (value || "").replace(/[^\d]/g, "");

export function ClientPageActions({ slug, buttons, integrations }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const sorted = [...buttons]
    .filter((button) => button.enabled)
    .sort((a, b) => a.order - b.order);

  const phoneDigits = sanitizePhone(integrations.whatsappPhone);

  const handleClick = (button: ClientButton) => {
    setMessage(null);
    if (button.type === "ORDER") {
      if (integrations.orderUrl) {
        window.location.href = integrations.orderUrl;
        return;
      }
      setMessage("Заказ пока недоступен.");
      return;
    }
    if (button.type === "WHATSAPP") {
      if (!phoneDigits) {
        setMessage("WhatsApp еще не настроен.");
        return;
      }
      window.location.href = `https://wa.me/${phoneDigits}`;
      return;
    }
    if (button.type === "KASPI") {
      if (!integrations.kaspiUrl) {
        setMessage("Kaspi пока недоступен.");
        return;
      }
      window.location.href = integrations.kaspiUrl;
      return;
    }
    if (button.type === "BOOKING") {
      window.location.href = `/${slug}/booking`;
      return;
    }
    if (button.type === "EXTERNAL_URL") {
      if (button.url) {
        window.location.href = button.url;
      }
    }
  };

  if (!sorted.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {sorted.map((button) => {
          if (button.type === "WHATSAPP" && !phoneDigits) return null;
          if (button.type === "KASPI" && !integrations.kaspiUrl) return null;
          return (
            <Button
              key={button.id}
              type="button"
              onClick={() => handleClick(button)}
              className="border-none text-white"
              style={{ backgroundColor: button.color }}
            >
              {button.text}
            </Button>
          );
        })}
      </div>
      {message ? (
        <p className="text-sm font-semibold text-primary">{message}</p>
      ) : null}
    </div>
  );
}
