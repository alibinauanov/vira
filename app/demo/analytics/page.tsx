import SalesMetricsCard from "@/components/shadcn-studio/blocks/chart-sales-metrics";
import { Card } from "@/components/ui/card";

type BarCardProps = {
  title: string;
  subtitle: string;
  value: string;
  delta: string;
  bars: number[];
  color: string;
};

type LineCardProps = {
  title: string;
  subtitle: string;
  value: string;
  delta: string;
  color: string;
  path: string;
  gradientFrom?: string;
  gradientTo?: string;
};

type DonutCardProps = {
  title: string;
  subtitle: string;
  value: string;
  delta: string;
  accent: string;
  label: string;
  labelValue: string;
};

function BarsCard({ title, subtitle, value, delta, bars, color }: BarCardProps) {
  return (
    <Card className="h-full rounded-2xl border border-slate-200 px-5 py-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="mt-4 flex h-28 items-end gap-2">
        {bars.map((height, idx) => (
          <div
            key={`${title}-${idx}`}
            className="relative flex h-full flex-1 items-end justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-slate-100" />
            <div
              className="absolute inset-x-0 bottom-0 rounded-full"
              style={{
                height: `${Math.min(Math.max(height, 0), 100)}%`,
                background: color,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-slate-900">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm font-medium text-slate-800">{delta}</p>
      </div>
    </Card>
  );
}

function LineCard({ title, subtitle, value, delta, color, path, gradientFrom, gradientTo }: LineCardProps) {
  return (
    <Card className="h-full rounded-2xl border border-slate-200 px-5 py-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="mt-4">
        <svg viewBox="0 0 240 100" className="w-full">
          {gradientFrom && gradientTo && (
            <defs>
              <linearGradient id={`${title}-grad`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={gradientFrom} stopOpacity="0.6" />
                <stop offset="100%" stopColor={gradientTo} stopOpacity="0" />
              </linearGradient>
            </defs>
          )}
          {gradientFrom && gradientTo && (
            <path
              d={`${path} L240 100 L0 100 Z`}
              fill={`url(#${title}-grad)`}
              stroke="none"
              opacity={0.5}
            />
          )}
          <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-slate-900">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm font-medium text-slate-800">{delta}</p>
      </div>
    </Card>
  );
}

function DonutCard({ title, subtitle, value, delta, accent, label, labelValue }: DonutCardProps) {
  return (
    <Card className="h-full rounded-2xl border border-slate-200 px-5 py-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="mt-4 flex flex-col items-center gap-3">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100"
          style={{
            background: `conic-gradient(${accent} 0deg 240deg, #e5e7eb 240deg 360deg)`,
          }}
        >
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white text-slate-900 shadow-inner">
            <span className="text-lg font-semibold">{labelValue}</span>
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-slate-900">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm font-medium text-slate-800">{delta}</p>
      </div>
    </Card>
  );
}

export default function DemoAnalyticsPage() {
  const cards = [
    {
      type: "bars" as const,
      title: "Заказы",
      subtitle: "Последняя неделя",
      value: "₸ 124K",
      delta: "+12.6%",
      bars: [28, 80, 64, 84, 60, 78, 70, 82, 68],
      color: "#f97316",
    },
    {
      type: "line" as const,
      title: "Рост продаж",
      subtitle: "Последние 12 дней",
      value: "₸ 12K",
      delta: "-18%",
      color: "#f4a300",
      path: "M0 70 C40 60 60 30 90 40 C120 50 150 20 180 36 C200 45 220 60 240 50",
      gradientFrom: "#fbbf24",
      gradientTo: "#fef3c7",
    },
    {
      type: "line" as const,
      title: "Прибыль",
      subtitle: "Прошлый месяц",
      value: "₸ 624K",
      delta: "+12.6%",
      color: "#0ea5e9",
      path: "M0 70 L40 32 L80 60 L120 45 L160 68 L200 52 L240 38",
    },
    {
      type: "line" as const,
      title: "Охваты",
      subtitle: "Прошлый год",
      value: "₸ 175K",
      delta: "+24%",
      color: "#f59e0b",
      path: "M0 60 L40 50 L80 56 L120 44 L160 46 L200 64 L240 40",
    },
    {
      type: "donut" as const,
      title: "Достигнутые",
      subtitle: "Последняя неделя",
      value: "₸ 32K",
      delta: "+12%",
      accent: "#f59e0b",
      labelValue: "500",
      label: "Гостей",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.08em] text-slate-500">Статистика</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Обзор аналитики</h1>
        <p className="text-slate-600 md:text-lg">
          Сводка ключевых метрик: заказы, продажи, прибыль, охваты и эффективность. Данные демо для визуализации.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          if (card.type === "bars") {
            return (
              <BarsCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                value={card.value}
                delta={card.delta}
                bars={card.bars}
                color={card.color}
              />
            );
          }
          if (card.type === "line") {
            return (
              <LineCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                value={card.value}
                delta={card.delta}
                color={card.color}
                path={card.path}
                gradientFrom={card.gradientFrom}
                gradientTo={card.gradientTo}
              />
            );
          }
          return (
            <DonutCard
              key={card.title}
              title={card.title}
              subtitle={card.subtitle}
              value={card.value}
              delta={card.delta}
              accent={card.accent}
              labelValue={card.labelValue}
              label={card.label}
            />
          );
        })}
      </div>

      <SalesMetricsCard className="border border-slate-200 rounded-3xl shadow-sm" />
    </div>
  );
}
