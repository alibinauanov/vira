import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  void params; // slug is not used here yet
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Настройки
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Предпочтения админа
        </h1>
        <p className="text-muted-foreground">
          Пока это заглушка. Дальше добавим уведомления, расписание и
          дополнительные настройки.
        </p>
      </div>

      <Card className="bg-white/80">
        <CardHeader className="text-lg font-semibold">
          Планы
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Управление временем работы филиала.</p>
          <p>• Настройка стандартной длительности брони.</p>
          <p>• Уведомления SMS/WhatsApp о новых заявках.</p>
          <p>• Экспорт бронирований по датам.</p>
        </CardContent>
      </Card>
    </div>
  );
}
