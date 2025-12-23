import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Админ Vira",
  description: "Админ-панель бронирований и настроек для ресторанов Vira.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="ru">
        <head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Poppins:wght@400;500;600;700&display=swap"
          />
        </head>
        <body className="antialiased bg-background text-foreground">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
