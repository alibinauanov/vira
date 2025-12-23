"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavigationProps = {
  activeSection?: string;
  onNavigate?: (href: string) => void;
};

type NavItem = {
  name: string;
  href: string;
};

const navItems: NavItem[] = [
  { name: "Главная", href: "#home" },
  { name: "Метрики", href: "#metrics" },
  { name: "Функции", href: "#product" },
  { name: "Демо", href: "#demo" },
  { name: "Тарифы", href: "#pricing" },
  { name: "Контакты", href: "#contact" },
];

function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Логотип Vira"
      width={32}
      height={32}
      className="h-8 w-8 rounded-xl"
      priority
    />
  );
}

export default function Navigation({ activeSection, onNavigate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#home");
  const pathname = usePathname();

  useEffect(() => {
    if (activeSection) {
      setActiveHash(activeSection);
    }
  }, [activeSection]);

  useEffect(() => {
    const current = window.location.hash || "#home";
    setActiveHash(current);
    const handleHash = () => setActiveHash(window.location.hash || "#home");
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const isItemActive = (href: string) => {
    if (href.startsWith("#")) {
      return activeHash === href || (!activeHash && href === "#home");
    }
    return pathname === href;
  };

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogoClick = () => {
    onNavigate?.("#home");
    setIsOpen(false);
  };

  return (
    <header className="fixed top-6 left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 px-4">
      <div className="relative border border-slate-200 bg-white/85 backdrop-blur shadow-sm rounded-2xl md:rounded-full">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2 font-semibold text-lg text-slate-900 hover:text-slate-700 transition-colors"
          >
            <Logo />
            <span>Vira</span>
          </button>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onNavigate?.(item.href)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="md:hidden rounded-md p-2 text-slate-700 hover:bg-slate-100 transition"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-slate-200">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      onNavigate?.(item.href);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
