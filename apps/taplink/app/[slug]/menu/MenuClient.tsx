"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Smartphone } from "lucide-react";

import { MenuCategory, MenuItem } from "@/data/menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

type CartItem = MenuItem & { quantity: number };

type Props = {
  slug: string;
  whatsappPhone?: string | null;
  orderUrl?: string | null;
  categories: MenuCategory[];
};

const formatPrice = (price: number) =>
  price.toLocaleString("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  });

export function MenuClient({ slug, whatsappPhone, orderUrl, categories }: Props) {
  const storageKey = useMemo(() => `taplink-cart-${slug}`, [slug]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CartItem[];
        setCart(parsed);
      } catch {
        // ignore parse errors
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, storageKey]);

  const addToCart = (item: MenuItem) => {
    setMessage(null);
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setMessage(null);
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => {
    setMessage(null);
    setCart([]);
  };

  const placeOrder = () => {
    if (!cart.length) {
      setMessage("Сначала добавьте блюда в корзину.");
      return;
    }
    if (orderUrl) {
      window.location.href = orderUrl;
      return;
    }
    setMessage("Заказ пока недоступен.");
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const phoneDigits = (whatsappPhone ?? "").replace(/[^\d]/g, "");
  const hasWhatsapp = phoneDigits.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="bg-white/80">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Меню
              </p>
              <h2 className="text-2xl font-semibold">Предзаказ во время брони</h2>
              <p className="text-muted-foreground">
                Добавьте блюда, которые хотите получить к вашему приходу.
                Оплаты и POS нет — подтвердим заказ в чате.
              </p>
            </div>
            <Button
              variant="ghost"
              href={hasWhatsapp ? `https://wa.me/${phoneDigits}` : undefined}
              disabled={!hasWhatsapp}
              className="hidden sm:inline-flex"
            >
              <Smartphone className="size-4" />
              Спросить в WhatsApp
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {categories.map((category) => (
            <div key={category.id} className="grid gap-3">
              <div className="flex items-center gap-2">
                <Badge tone="neutral" className="bg-primary/10 text-primary">
                  {category.name}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-muted/30 p-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <p className="text-base font-semibold">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.tags?.map((tag) => (
                            <Badge
                              key={tag}
                              tone="neutral"
                              className="bg-white text-muted-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {item.badge ? (
                            <Badge tone="success">{item.badge}</Badge>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground">
                        Готовность ~10 минут
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => addToCart(item)}
                      >
                        Добавить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="bg-white/80">
          <CardHeader className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Корзина
              </p>
              <p className="text-lg font-semibold">
                {cart.length ? `${cart.length} позиций` : "Корзина пустая"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!cart.length ? (
              <p className="text-sm text-muted-foreground">
                Добавьте блюда в корзину, чтобы оформить предзаказ.
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-muted/40 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.price)} за шт.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateQuantity(String(item.id), item.quantity - 1)
                          }
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateQuantity(String(item.id), item.quantity + 1)
                          }
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Итого</span>
              <span>{formatPrice(total)}</span>
            </div>

            {message ? (
              <p className="text-sm font-semibold text-primary">{message}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button onClick={placeOrder} type="button" disabled={!cart.length}>
                Отправить заказ (демо)
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={clearCart}
                disabled={!cart.length}
              >
                Очистить
              </Button>
              <Button
                variant="ghost"
                type="button"
                href={hasWhatsapp ? `https://wa.me/${phoneDigits}` : undefined}
                disabled={!hasWhatsapp}
              >
                Спросить в WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-primary/5 to-primary/10">
          <CardHeader className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-primary">
              Как это работает
            </p>
          <p className="text-muted-foreground">
            Заказы сохраняются локально. Команда напишет вам с номера{" "}
            <span className="font-semibold text-primary">
              {whatsappPhone ?? "—"}
            </span>
            , чтобы
            подтвердить или скорректировать позиции.
          </p>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
