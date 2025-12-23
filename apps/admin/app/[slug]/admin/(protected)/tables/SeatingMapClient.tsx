"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Grip, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TableItem = {
  id?: number;
  number: string;
  label?: string | null;
  seats: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number | null;
};

type FloorPlan = {
  id?: number;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  tables: TableItem[];
};

type Props = {
  slug: string;
  initialPlan: FloorPlan;
};

type DragState = {
  id: number | string;
  offsetX: number;
  offsetY: number;
};

type ResizeState = {
  id: number | string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

const GRID_SIZE = 24;
const MIN_TABLE_SIZE = GRID_SIZE * 2;

const snapToGrid = (value: number) =>
  Math.round(value / GRID_SIZE) * GRID_SIZE;

const getTableKey = (table: TableItem) =>
  table.id ? `id:${table.id}` : `tmp:${table.number}`;

export function SeatingMapClient({ slug, initialPlan }: Props) {
  const [plan, setPlan] = useState<FloorPlan>(initialPlan);
  const [selectedId, setSelectedId] = useState<number | string | null>(
    initialPlan.tables[0] ? getTableKey(initialPlan.tables[0]) : null,
  );
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const selectedTable = useMemo(
    () =>
      plan.tables.find(
        (table) => getTableKey(table) === selectedId,
      ) ?? null,
    [plan.tables, selectedId],
  );

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    tableId: number | string,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDragging({
      id: tableId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    });
    setSelectedId(tableId);
  };

  const handleResizeDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    table: TableItem,
  ) => {
    event.stopPropagation();
    setResizing({
      id: getTableKey(table),
      startX: event.clientX,
      startY: event.clientY,
      startWidth: table.width,
      startHeight: table.height,
    });
    setSelectedId(getTableKey(table));
  };

  useEffect(() => {
    if (!dragging && !resizing) return;

    const handleMove = (event: PointerEvent) => {
      const container = mapRef.current?.getBoundingClientRect();
      if (!container) return;

      setPlan((prev) => {
        const tables = prev.tables.map((table) => {
          const tableId = getTableKey(table);
          if (dragging && tableId === dragging.id) {
            const rawX =
              event.clientX - container.left - dragging.offsetX;
            const rawY = event.clientY - container.top - dragging.offsetY;
            const snappedX = snapToGrid(rawX);
            const snappedY = snapToGrid(rawY);
            const nextX = Math.max(
              0,
              Math.min(snappedX, prev.canvasWidth - table.width),
            );
            const nextY = Math.max(
              0,
              Math.min(snappedY, prev.canvasHeight - table.height),
            );
            return { ...table, x: nextX, y: nextY };
          }
          if (resizing && tableId === resizing.id) {
            const deltaX = event.clientX - resizing.startX;
            const deltaY = event.clientY - resizing.startY;
            const rawWidth = Math.max(
              MIN_TABLE_SIZE,
              resizing.startWidth + deltaX,
            );
            const rawHeight = Math.max(
              MIN_TABLE_SIZE,
              resizing.startHeight + deltaY,
            );
            const maxWidth = Math.max(0, prev.canvasWidth - table.x);
            const maxHeight = Math.max(0, prev.canvasHeight - table.y);
            const nextWidth = Math.min(snapToGrid(rawWidth), maxWidth);
            const nextHeight = Math.min(snapToGrid(rawHeight), maxHeight);
            return {
              ...table,
              width: Math.max(MIN_TABLE_SIZE, nextWidth),
              height: Math.max(MIN_TABLE_SIZE, nextHeight),
            };
          }
          return table;
        });
        return { ...prev, tables };
      });
    };

    const handleUp = () => {
      setDragging(null);
      setResizing(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, resizing]);

  const addTable = () => {
    const existingNumbers = plan.tables
      .map((table) => Number(table.number))
      .filter((value) => !Number.isNaN(value));
    const nextNumber = existingNumbers.length
      ? Math.max(...existingNumbers) + 1
      : plan.tables.length + 1;
    const newTable: TableItem = {
      number: `${nextNumber}`,
      label: null,
      seats: 4,
      x: GRID_SIZE * 2,
      y: GRID_SIZE * 2,
      width: GRID_SIZE * 3,
      height: GRID_SIZE * 3,
      rotation: null,
    };
    setPlan((prev) => ({
      ...prev,
      tables: [...prev.tables, newTable],
    }));
    setSelectedId(getTableKey(newTable));
  };

  const updateSelected = (patch: Partial<TableItem>) => {
    if (!selectedTable) return;
    if (!selectedTable.id && patch.number) {
      setSelectedId(`tmp:${patch.number}`);
    }
    const normalizedPatch = { ...patch };
    if (typeof normalizedPatch.width === "number") {
      normalizedPatch.width = Math.max(
        MIN_TABLE_SIZE,
        snapToGrid(normalizedPatch.width),
      );
    }
    if (typeof normalizedPatch.height === "number") {
      normalizedPatch.height = Math.max(
        MIN_TABLE_SIZE,
        snapToGrid(normalizedPatch.height),
      );
    }
    setPlan((prev) => ({
      ...prev,
      tables: prev.tables.map((table) =>
        getTableKey(table) === getTableKey(selectedTable)
          ? { ...table, ...normalizedPatch }
          : table,
      ),
    }));
  };

  const removeSelected = () => {
    if (!selectedTable) return;
    setPlan((prev) => ({
      ...prev,
      tables: prev.tables.filter(
        (table) => getTableKey(table) !== getTableKey(selectedTable),
      ),
    }));
    setSelectedId(null);
  };

  const savePlan = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/${slug}/tables`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: plan.name,
          canvasWidth: plan.canvasWidth,
          canvasHeight: plan.canvasHeight,
          tables: plan.tables,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Не удалось сохранить план зала.");
      }
      setPlan(body.floorPlan);
      setSuccess("План сохранен.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить план.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Карта зала
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Расстановка столов
          </h1>
          <p className="text-muted-foreground">
            Перетаскивайте столы, меняйте размеры и редактируйте подписи.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={addTable}>
            <Plus className="size-4" />
            Добавить стол
          </Button>
          <Button onClick={savePlan} loading={saving}>
            <Save className="size-4" />
            Сохранить изменения
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <Card className="bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Полотно</p>
              <p className="text-xs text-muted-foreground">
                {plan.canvasWidth}×{plan.canvasHeight}px
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                className="w-24"
                type="number"
                min={400}
                value={plan.canvasWidth}
                onChange={(event) =>
                  setPlan((prev) => ({
                    ...prev,
                    canvasWidth: Number(event.target.value),
                  }))
                }
              />
              <Input
                className="w-24"
                type="number"
                min={300}
                value={plan.canvasHeight}
                onChange={(event) =>
                  setPlan((prev) => ({
                    ...prev,
                    canvasHeight: Number(event.target.value),
                  }))
                }
              />
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div
              ref={mapRef}
              className="relative rounded-xl border border-dashed border-border bg-muted/40"
              style={{
                width: plan.canvasWidth,
                height: plan.canvasHeight,
                backgroundSize: "24px 24px",
                backgroundImage:
                  "linear-gradient(to right, rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.2) 1px, transparent 1px)",
              }}
            >
              {plan.tables.map((table) => {
                const tableKey = getTableKey(table);
                const isSelected = selectedId === tableKey;
                return (
                  <div
                    key={tableKey}
                    role="button"
                    tabIndex={0}
                    onPointerDown={(event) =>
                      handlePointerDown(event, tableKey)
                    }
                    onClick={() => setSelectedId(tableKey)}
                    className={cn(
                      "absolute flex cursor-grab flex-col items-center justify-center rounded-lg border border-border bg-white shadow-sm",
                      isSelected && "border-primary ring-2 ring-primary/30",
                    )}
                    style={{
                      left: table.x,
                      top: table.y,
                      width: table.width,
                      height: table.height,
                      transform: table.rotation
                        ? `rotate(${table.rotation}deg)`
                        : undefined,
                    }}
                  >
                    <div className="text-xs font-semibold">
                      Стол {table.number}
                    </div>
                    {table.label ? (
                      <div className="text-[10px] text-muted-foreground">
                        {table.label}
                      </div>
                    ) : null}
                    <div className="text-[10px] text-muted-foreground">
                      {table.seats} мест
                    </div>
                    <button
                      type="button"
                      onPointerDown={(event) =>
                        handleResizeDown(event, table)
                      }
                      className="absolute -bottom-2 -right-2 flex size-5 items-center justify-center rounded-full border border-border bg-white shadow-sm"
                    >
                      <Grip className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-white/90">
            <CardHeader>
              <p className="text-sm font-semibold">Настройки стола</p>
              <p className="text-xs text-muted-foreground">
                Выберите стол, чтобы редактировать параметры.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedTable ? (
                <>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold">Номер</label>
                    <Input
                      value={selectedTable.number}
                      onChange={(event) =>
                        updateSelected({ number: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold">Зона / метка</label>
                    <Input
                      value={selectedTable.label ?? ""}
                      onChange={(event) =>
                        updateSelected({ label: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold">
                      Количество мест
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={selectedTable.seats}
                      onChange={(event) =>
                        updateSelected({
                          seats: Math.max(1, Number(event.target.value)),
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold">Ширина</label>
                      <Input
                        type="number"
                        min={40}
                        value={selectedTable.width}
                        onChange={(event) =>
                          updateSelected({
                            width: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold">Высота</label>
                      <Input
                        type="number"
                        min={40}
                        value={selectedTable.height}
                        onChange={(event) =>
                          updateSelected({
                            height: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold">Поворот</label>
                    <Input
                      type="number"
                      min={0}
                      max={360}
                      value={selectedTable.rotation ?? 0}
                      onChange={(event) =>
                        updateSelected({
                          rotation: Number(event.target.value),
                        })
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-destructive"
                    onClick={removeSelected}
                  >
                    <Trash2 className="size-4" />
                    Удалить стол
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Выберите стол, чтобы редактировать его.
                </p>
              )}
            </CardContent>
          </Card>

          {error ? (
            <Card className="border-destructive/30">
              <CardContent className="p-4 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          ) : null}

          {success ? (
            <Card className="border-emerald-200">
              <CardContent className="p-4 text-sm text-emerald-700">
                {success}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
