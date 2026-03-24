import { prisma } from "@/lib/prisma";
import { getColorType } from "@/lib/holidays";
import { formatDate, formatDateLabel } from "@/lib/date-utils";
import MealPlanClient from "./components/MealPlanClient";
import type { DayData } from "./components/MealPlanClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 30);

  const [mealPlans, memo] = await Promise.all([
    prisma.mealPlan.findMany({
      where: {
        date: { gte: today, lte: endDate },
      },
      orderBy: { date: "asc" },
    }),
    prisma.ingredientsMemo.findFirst({
      orderBy: { id: "desc" },
    }),
  ]);

  const planMap = new Map<string, { menu_text: string | null; schedule_text: string | null }>();
  for (const plan of mealPlans) {
    planMap.set(formatDate(new Date(plan.date)), plan);
  }

  const days: DayData[] = [];
  for (let i = 0; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = formatDate(date);
    const plan = planMap.get(dateStr);

    days.push({
      date: dateStr,
      dateLabel: formatDateLabel(date),
      color: getColorType(date),
      menuText: plan?.menu_text ?? "",
      scheduleText: plan?.schedule_text ?? "",
      isToday: dateStr === todayStr,
    });
  }

  const memoText = memo?.memo_text ?? "";

  return (
    <div className="max-w-[600px] mx-auto">
      {/* ヘッダー */}
      <header
        className="sticky z-50 text-white text-center py-3"
        style={{
          backgroundColor: "#555555",
          top: "var(--sat)",
        }}
      >
        <h1
          className="text-2xl tracking-wide"
          style={{
            fontFamily:
              "'HGS\u5275\u82F1\u89D2\uFF7A\uFF9E\uFF7C\uFF6F\uFF78UB', 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
            fontWeight: 900,
          }}
        >
          ばんごはん.com
        </h1>
      </header>

      <MealPlanClient initialDays={days} initialMemoText={memoText} />
    </div>
  );
}
