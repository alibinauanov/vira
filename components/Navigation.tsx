"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavigationProps = {
  activeSection?: string;
};

type NavItem = {
  name: string;
  href: string;
};

const navItems: NavItem[] = [
  { name: "Главная", href: "#home" },
  { name: "Функции", href: "#product" },
  { name: "Тарифы", href: "#pricing" },
  { name: "Контакты", href: "#contact" },
];

function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#0B0B0B" />
      <path
        d="M18 44.5 29 18h6l11 26.5"
        stroke="#F5F5F5"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m26 38 6-14 6 14"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navigation({ activeSection }: NavigationProps) {
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

  return (
    <header className="fixed top-6 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4">
      <div className="relative border border-slate-200 bg-white/85 backdrop-blur shadow-sm rounded-2xl md:rounded-full">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg text-slate-900 hover:text-slate-700 transition-colors"
          >
            <Logo />
            <span>Vira</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.name}
                </Link>
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
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
