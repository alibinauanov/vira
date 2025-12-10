"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRightIcon } from "lucide-react";

import Navigation from "@/components/Navigation";
import { Announcement, AnnouncementTitle } from "@/components/ui/announcement";

export default function Home() {
  type Feature = {
    title: string;
    impact: string;
    image?: string;
    images?: string[];
  };

  const features: Feature[] = [
    {
      title: "ИИ-агент для обработки обращений",
      impact:
        "Быстрые ответы на обращения клиентов повысят доходимость на 20%",
      image: "/screen1.png",
    },
    {
      title: "Бронь столиков",
      impact:
        "Быстрая бронь столиков и автоматические напоминания клиенту увеличат доходимость на 30%",
      images: ["/screen2.png", "/screen3.png"],
    },
    {
      title: "Рассылка по базе номеров",
      impact:
        "Регулярные напоминания о вашем заведении и персональные плюшки увеличат повторные посещения на 35%",
      image: "/screen4.png",
    },
    {
      title: "Удобная система заказов",
      impact:
        "Подписки на ваше заведение и возможность сделать заказ быстро через сайт увеличит LTV на 40%",
      image: "/screen5.png",
    },
  ];

  const pricingTiers = [
    {
      name: "Начало",
      price: "20,000 ₸",
      cadence: "первый месяц",
      points: [
        "Весь функционал",
      ],
      cta: "Связаться",
      highlight: false,
    },
    {
      name: "Стандарт",
      price: "50,000 ₸",
      cadence: "в месяц",
      points: [
        "Все сценарии и автоматизации",
        "Бронь столиков",
        "Рассылки по базам",
        "Удобная система онлайн-заказов",
        "Возможность для клиентов оформить подписки",
      ],
      cta: "Связаться",
      highlight: false,
    },
    {
      name: "Премиум",
      price: "150,000 ₸",
      cadence: "в месяц",
      points: [
        "Все что в стандарте",
        "Расширенная аналитика",
        "Ежемесячный полный аудит процессов",
        "Приоритетная поддержка",
      ],
      cta: "Связаться",
      highlight: false,
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const featureRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const featureScrollRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const productRef = useRef<HTMLElement | null>(null);
  const pricingRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState<string>("#home");

  useEffect(() => {
    const root = featureScrollRef.current;
    const sections = featureRefs.current.filter(Boolean) as HTMLElement[];
    if (!root || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = Number(visible.target.getAttribute("data-index"));
          if (!Number.isNaN(idx)) setActiveSlide(idx);
        }
      },
      { threshold: [0.35, 0.55], root },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [features.length]);

  useEffect(() => {
    const inner = featureScrollRef.current;
    const outer = scrollContainerRef.current;
    if (!inner || !outer) return;

    const edgeThreshold = 6;
    const overscrollThreshold = 36;
    const overscrollStep = 16;
    const boundaryDelayMs = 320; // Delay handoff so the last feature isn't skipped on momentum
    let touchStartY = 0;
    let wheelBoundary: "top" | "bottom" | null = null;
    let wheelAccumulated = 0;
    let wheelBoundaryEnteredAt = 0;
    let touchBoundary: "top" | "bottom" | null = null;
    let touchAccumulated = 0;
    let touchBoundaryEnteredAt = 0;

    // Handoff scroll between feature list (inner) and page (outer) only after sustained overscroll
    const handleWheel = (event: WheelEvent) => {
      const deltaY = event.deltaY;
      const atTop = inner.scrollTop <= edgeThreshold;
      const atBottom = inner.scrollHeight - inner.clientHeight - inner.scrollTop <= edgeThreshold;
      const boundary = deltaY < 0 && atTop ? "top" : deltaY > 0 && atBottom ? "bottom" : null;

      if (!boundary) {
        wheelBoundary = null;
        wheelAccumulated = 0;
        wheelBoundaryEnteredAt = 0;
        return;
      }

      const now = performance.now();

      if (wheelBoundary !== boundary) {
        wheelBoundary = boundary;
        wheelAccumulated = 0;
        wheelBoundaryEnteredAt = now;
        event.preventDefault();
        return;
      }

      if (now - wheelBoundaryEnteredAt < boundaryDelayMs) {
        wheelBoundaryEnteredAt = now;
        event.preventDefault();
        return;
      }

      const step = Math.sign(deltaY) * Math.min(Math.abs(deltaY), overscrollStep);
      wheelAccumulated += step;
      event.preventDefault();
      if (Math.abs(wheelAccumulated) >= overscrollThreshold) {
        outer.scrollBy({ top: deltaY, behavior: "smooth" });
        wheelAccumulated = 0;
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const currentY = event.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;

      const atTop = inner.scrollTop <= edgeThreshold;
      const atBottom = inner.scrollHeight - inner.clientHeight - inner.scrollTop <= edgeThreshold;
      const boundary = deltaY < 0 && atTop ? "top" : deltaY > 0 && atBottom ? "bottom" : null;

      if (!boundary) {
        touchBoundary = null;
        touchAccumulated = 0;
        touchBoundaryEnteredAt = 0;
        return;
      }

      const now = performance.now();

      if (touchBoundary !== boundary) {
        touchBoundary = boundary;
        touchAccumulated = 0;
        touchBoundaryEnteredAt = now;
        event.preventDefault();
        return;
      }

      if (now - touchBoundaryEnteredAt < boundaryDelayMs) {
        touchBoundaryEnteredAt = now;
        event.preventDefault();
        return;
      }

      const step = Math.sign(deltaY) * Math.min(Math.abs(deltaY), overscrollStep);
      touchAccumulated += step;
      event.preventDefault();
      if (Math.abs(touchAccumulated) >= overscrollThreshold) {
        outer.scrollBy({ top: deltaY, behavior: "smooth" });
        touchAccumulated = 0;
      }
    };

    inner.addEventListener("wheel", handleWheel, { passive: false });
    inner.addEventListener("touchstart", handleTouchStart, { passive: true });
    inner.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      inner.removeEventListener("wheel", handleWheel);
      inner.removeEventListener("touchstart", handleTouchStart);
      inner.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;
    const sections = [
      { ref: heroRef, id: "#home" },
      { ref: productRef, id: "#product" },
      { ref: pricingRef, id: "#pricing" },
      { ref: contactRef, id: "#contact" },
    ].filter((s) => s.ref.current) as {
      ref: React.RefObject<HTMLElement | null>;
      id: string;
    }[];

    if (!root || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        const topMost = visible.reduce((prev, current) =>
          prev.intersectionRatio > current.intersectionRatio ? prev : current,
        );
        const id = topMost.target.getAttribute("id");
        if (id) setActiveSection(`#${id}`);
      },
      { threshold: [0.4, 0.6], root },
    );

    sections.forEach((section) => observer.observe(section.ref.current as Element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "#home";
    const sectionMap: Record<string, React.RefObject<HTMLElement | null>> = {
      "#home": heroRef,
      "#product": productRef,
      "#pricing": pricingRef,
      "#contact": contactRef,
    };
    const targetRef = sectionMap[hash];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "auto", block: "start" });
      setActiveSection(hash);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeSection) return;
    if (window.location.hash === activeSection) return;
    // Only update URL when navigation is triggered explicitly (e.g., via navbar anchor)
    // to avoid changing the hash on scroll-driven section highlights.
  }, [activeSection]);

  const scrollToSection = useCallback(
    (id: string) => {
      const sectionMap: Record<string, React.RefObject<HTMLElement | null>> = {
        "#home": heroRef,
        "#product": productRef,
        "#pricing": pricingRef,
        "#contact": contactRef,
      };
      const targetRef = sectionMap[id];
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(id);
      }
    },
    [],
  );

  return (
    <>
      <Navigation activeSection={activeSection} onNavigate={scrollToSection} />
      <div
        ref={scrollContainerRef}
        className="h-screen overflow-y-auto scroll-smooth md:snap-y md:snap-mandatory"
      >
        <section
          id="home"
          ref={heroRef}
          className="relative h-screen w-full bg-white bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gridBackground.png')] bg-no-repeat bg-cover bg-center bg-blend-lighten text-sm text-slate-900 overflow-hidden md:snap-start"
        >
          <div className="absolute inset-0 bg-white/70" aria-hidden="true" />
          <div className="hero-dots" aria-hidden="true" />

          <div className="relative z-10 flex flex-col h-full pb-28 pt-28 md:pt-32 md:pb-32">
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-6">
              <h1 className="text-4xl md:text-7xl font-medium max-w-[850px] leading-tight">
                Цифровой помощник для{" "}
                <span className="bg-black text-white px-2 rounded-md">
                  современных
                </span>{" "}
                ресторанов и кофеен
              </h1>

              <p className="text-sm md:text-base max-w-2xl text-slate-700">
                Автоматизируйте ответы, брони, рассылки и заказы — чтобы гости
                приходили чаще, а команда тратила меньше времени.
              </p>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  className="inline-flex"
                  onClick={() => scrollToSection("#contact")}
                >
                  <Announcement movingBorder>
                    <AnnouncementTitle className="text-sm md:text-base">
                      Связаться с нами
                      <ArrowUpRightIcon className="shrink-0 text-muted-foreground" size={16} />
                    </AnnouncementTitle>
                  </Announcement>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="product"
          ref={productRef}
          className="relative z-10 w-full h-screen px-0 md:px-8 lg:px-12 xl:px-16 py-12 md:py-20 bg-white/60 backdrop-blur md:snap-start md:snap-always flex flex-col"
        >
          <div className="relative md:sticky md:top-28 z-40 px-6 md:px-12 pt-2 pb-4 bg-white md:bg-white/85 md:backdrop-blur">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Что мы делаем
            </h2>
            <p className="text-slate-600 mt-2">
              Четыре ключевых сценария, которые увеличат посещаемость и LTV вашего
              заведения.
            </p>
            <div className="flex items-center gap-2 pt-3">
              {features.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                    idx === activeSlide ? "bg-slate-900" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            ref={featureScrollRef}
            className="mt-4 flex-1 snap-y snap-mandatory overflow-y-auto no-scrollbar scroll-smooth"
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                data-index={index}
                ref={(el) => {
                  featureRefs.current[index] = el;
                }}
                className="snap-start snap-always min-h-full flex flex-col md:flex-row items-center justify-start md:justify-center gap-6 md:gap-10 px-6 md:px-12 py-10 md:py-12"
              >
                <div className="md:w-1/2 space-y-3 md:space-y-4">
                  <div className="text-sm uppercase tracking-[0.08em] text-slate-500">
                    0{index + 1}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
                    {feature.impact}
                  </p>
                </div>

                <div className="md:w-1/2 w-full">
                  <div
                    className={`rounded-2xl ${
                      feature.images
                        ? "grid items-start grid-cols-2 gap-2 md:gap-3"
                        : "overflow-hidden flex items-center justify-center"
                    }`}
                  >
                    {feature.images ? (
                      feature.images.map((src, imgIndex) => (
                        <div
                          key={`${feature.title}-${src}`}
                          className="rounded-xl overflow-hidden flex items-center justify-center"
                        >
                          <img
                            src={src}
                            alt={`${feature.title} — экран ${imgIndex + 1}`}
                            className="block w-full h-auto object-contain max-h-[46vh] sm:max-h-[56vh] md:max-h-[64vh]"
                            loading="lazy"
                          />
                        </div>
                      ))
                    ) : (
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="block w-full h-auto max-h-[50vh] md:max-h-[55vh] object-contain"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="pricing"
          ref={pricingRef}
          className="relative z-10 w-full min-h-[120vh] md:h-screen px-4 md:px-8 lg:px-12 xl:px-16 py-16 md:py-24 bg-white md:snap-start mt-16 md:mt-0"
        >
          <div className="max-w-6xl mx-auto h-full flex flex-col items-center text-center gap-6 justify-center">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.08em] text-slate-500">
                Тарифы
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
                Простые планы для роста
              </h2>
              <p className="text-slate-600 max-w-2xl">
                Выбирайте тариф, который соответствует вашему темпу: от теста
                гипотез до масштабирования сети заведений.
              </p>
            </div>

            <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 md:p-8 text-left shadow-sm flex flex-col h-full min-h-[440px] md:min-h-[520px] ${
                    tier.highlight ? "ring-2 ring-slate-900" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {tier.name}
                    </h3>
                    {tier.highlight && (
                      <span className="text-xs font-semibold text-white bg-slate-900 px-3 py-1 rounded-full">
                        Популярно
                      </span>
                    )}
                  </div>
                  <div className="mt-4 text-3xl font-semibold text-slate-900">
                    {tier.price}
                    {tier.cadence && (
                      <span className="text-base font-medium text-slate-500 ml-2">
                        {tier.cadence}
                      </span>
                    )}
                  </div>

                  <ul className="mt-6 md:mt-8 space-y-3 text-sm text-slate-700 flex-1">
                    {tier.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-slate-900" />
                        <span
                          className={
                            point.startsWith("Весь функционал") ||
                            point.startsWith("Все что в стандарте")
                              ? "font-semibold"
                              : undefined
                          }
                        >
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className="mt-6 md:mt-auto w-full inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition border border-slate-300 text-slate-900 hover:bg-slate-100"
                  >
                    {tier.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="contact"
          ref={contactRef}
          className="relative z-10 w-full h-screen px-4 md:px-8 lg:px-12 xl:px-16 py-16 md:py-24 bg-white md:snap-start"
        >
          <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center text-center gap-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.08em] text-slate-500">
                Свяжитесь с нами
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
                Готовы обсудить детали?
              </h2>
              <p className="text-slate-600 max-w-2xl">
                Позвоните нам или напишите в WhatsApp — ответим быстро и подскажем,
                как запустить проект под ваши задачи.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="text-3xl font-semibold text-slate-900">
                +7 (707) 173-85-30
              </div>
              <a
                href="https://wa.me/77071738530"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 text-sm font-medium transition shadow"
                target="_blank"
                rel="noopener noreferrer"
              >
                Написать в WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
