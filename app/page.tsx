"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface DayData {
  date: string; // YYYY-MM-DD
  dateLabel: string; // M/D(曜)
  color: string; // black, blue, red
  menuText: string;
  scheduleText: string;
  isToday: boolean;
}

interface MealPlanRecord {
  id: number;
  date: string;
  menu_text: string | null;
  schedule_text: string | null;
}

export default function Home() {
  const [days, setDays] = useState<DayData[]>([]);
  const [memoText, setMemoText] = useState("");
  const memoRef = useRef<HTMLDivElement>(null);
  const memoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // 日付データを生成
  const generateDays = useCallback((mealPlans: MealPlanRecord[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);

    const planMap = new Map<string, MealPlanRecord>();
    for (const plan of mealPlans) {
      const d = new Date(plan.date);
      planMap.set(formatDate(d), plan);
    }

    const result: DayData[] = [];
    for (let i = 0; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = formatDate(date);
      const plan = planMap.get(dateStr);

      result.push({
        date: dateStr,
        dateLabel: formatDateLabel(date),
        color: getColorForDate(date),
        menuText: plan?.menu_text ?? "",
        scheduleText: plan?.schedule_text ?? "",
        isToday: dateStr === todayStr,
      });
    }

    return result;
  }, []);

  // データ取得
  useEffect(() => {
    async function fetchData() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const from = formatDate(today);
      const toDate = new Date(today);
      toDate.setDate(today.getDate() + 30);
      const to = formatDate(toDate);

      const [mealPlansRes, memoRes] = await Promise.all([
        fetch(`/api/meal-plan?from=${from}&to=${to}`),
        fetch("/api/ingredients-memo"),
      ]);

      const mealPlans: MealPlanRecord[] = await mealPlansRes.json();
      const memo = await memoRes.json();

      setDays(generateDays(mealPlans));
      setMemoText(memo.memo_text ?? "");
    }

    fetchData();
  }, [generateDays]);

  // メモ保存
  const saveMemo = useCallback((text: string) => {
    if (memoTimerRef.current) clearTimeout(memoTimerRef.current);
    memoTimerRef.current = setTimeout(() => {
      fetch("/api/ingredients-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo_text: text }),
      });
    }, 300);
  }, []);

  // セル保存
  const saveCell = useCallback(
    (dateStr: string, field: "menu_text" | "schedule_text", value: string) => {
      const timerKey = `${dateStr}-${field}`;
      if (saveTimersRef.current[timerKey]) {
        clearTimeout(saveTimersRef.current[timerKey]);
      }

      // ローカルstate更新
      setDays((prev) =>
        prev.map((day) => {
          if (day.date === dateStr) {
            return {
              ...day,
              menuText: field === "menu_text" ? value : day.menuText,
              scheduleText:
                field === "schedule_text" ? value : day.scheduleText,
            };
          }
          return day;
        })
      );

      // DB保存
      saveTimersRef.current[timerKey] = setTimeout(() => {
        const currentDay = days.find((d) => d.date === dateStr);
        const payload = {
          date: dateStr,
          menu_text: field === "menu_text" ? value : (currentDay?.menuText ?? ""),
          schedule_text:
            field === "schedule_text" ? value : (currentDay?.scheduleText ?? ""),
        };
        fetch("/api/meal-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }, 300);
    },
    [days]
  );

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
              "'HGS創英角ｺﾞｼｯｸUB', 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
            fontWeight: 900,
          }}
        >
          ばんごはん.com
        </h1>
      </header>

      {/* メモエリア（sticky固定・タップで編集可能） */}
      <div
        className="sticky z-40 bg-white px-3 py-4"
        id="memo-wrapper"
        style={{ top: "calc(var(--sat) + 48px)" }}
      >
        <div
          ref={memoRef}
          className="memo-area bg-white border border-gray-300 rounded-xl px-4 py-6 text-base min-h-[60px]"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const text = e.currentTarget.textContent?.trim() ?? "";
            saveMemo(text);
          }}
          dangerouslySetInnerHTML={{ __html: memoText }}
        />
      </div>

      {/* 献立リスト */}
      <div className="px-3 pb-8" id="dinner-list">
        <table className="w-full border-collapse border border-gray-400 text-sm table-fixed">
          <colgroup>
            <col style={{ width: "72px" }} />
            <col style={{ width: "72px" }} />
            <col />
          </colgroup>
          <tbody>
            {days.map((day) => (
              <tr
                key={day.date}
                className="border border-gray-300"
                id={day.isToday ? "today-row" : undefined}
              >
                <td
                  className="border border-gray-300 px-2 py-2 whitespace-nowrap text-center"
                  style={{
                    color:
                      day.color === "red"
                        ? "#FF0000"
                        : day.color === "blue"
                          ? "#0000FF"
                          : "#000000",
                    fontFamily:
                      "'Meiryo', 'メイリオ', 'Hiragino Kaku Gothic ProN', sans-serif",
                  }}
                >
                  {day.dateLabel}
                </td>
                <td
                  className="border border-gray-300 px-2 py-2"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const value = e.currentTarget.textContent?.trim() ?? "";
                    saveCell(day.date, "schedule_text", value);
                  }}
                  dangerouslySetInnerHTML={{ __html: day.scheduleText }}
                />
                <td
                  className="border border-gray-300 px-2 py-2"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const value = e.currentTarget.textContent?.trim() ?? "";
                    saveCell(day.date, "menu_text", value);
                  }}
                  dangerouslySetInnerHTML={{ __html: day.menuText }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ユーティリティ関数
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const WEEKDAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateLabel(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = WEEKDAY_NAMES[date.getDay()];
  return `${m}/${d}(${w})`;
}

// 祝日判定（クライアントサイド用）
const FIXED_HOLIDAYS: { month: number; day: number }[] = [
  { month: 1, day: 1 },
  { month: 2, day: 11 },
  { month: 2, day: 23 },
  { month: 4, day: 29 },
  { month: 5, day: 3 },
  { month: 5, day: 4 },
  { month: 5, day: 5 },
  { month: 8, day: 11 },
  { month: 11, day: 3 },
  { month: 11, day: 23 },
];

const HAPPY_MONDAY: { month: number; weekOfMonth: number }[] = [
  { month: 1, weekOfMonth: 2 },
  { month: 7, weekOfMonth: 3 },
  { month: 9, weekOfMonth: 3 },
  { month: 10, weekOfMonth: 2 },
];

function getNthMonday(year: number, month: number, n: number): number {
  const first = new Date(year, month - 1, 1);
  const firstMonday =
    first.getDay() <= 1
      ? 1 + (1 - first.getDay())
      : 1 + (8 - first.getDay());
  return firstMonday + (n - 1) * 7;
}

function getVernalEquinox(year: number): number {
  return Math.floor(
    20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)
  );
}

function getAutumnalEquinox(year: number): number {
  return Math.floor(
    23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)
  );
}

function isHolidayCore(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const h of FIXED_HOLIDAYS) {
    if (h.month === month && h.day === day) return true;
  }
  for (const h of HAPPY_MONDAY) {
    if (h.month === month && day === getNthMonday(year, month, h.weekOfMonth))
      return true;
  }
  if (month === 3 && day === getVernalEquinox(year)) return true;
  if (month === 9 && day === getAutumnalEquinox(year)) return true;
  return false;
}

function isJapaneseHoliday(date: Date): boolean {
  if (isHolidayCore(date)) return true;
  // 振替休日
  if (date.getDay() === 1) {
    const yesterday = new Date(date);
    yesterday.setDate(date.getDate() - 1);
    if (yesterday.getDay() === 0 && isHolidayCore(yesterday)) return true;
  }
  return false;
}

function getColorForDate(date: Date): string {
  if (date.getDay() === 0 || isJapaneseHoliday(date)) return "red";
  if (date.getDay() === 6) return "blue";
  return "black";
}
