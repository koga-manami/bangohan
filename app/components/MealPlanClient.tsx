"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getColorType } from "@/lib/holidays";
import { formatDate, formatDateLabel, getTodayJST } from "@/lib/date-utils";

interface DayData {
  date: string;
  dateLabel: string;
  color: string;
  menuText: string;
  scheduleText: string;
  isToday: boolean;
}

export default function MealPlanClient() {
  const [days, setDays] = useState<DayData[] | null>(null);
  const [memoText, setMemoText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const memoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );
  const memoRef = useRef<HTMLDivElement>(null);

  // マウント時にAPIからデータを取得（プログレスバー表示）
  useEffect(() => {
    const today = getTodayJST();
    const todayStr = formatDate(today);
    const endDate = new Date(today.getTime());
    endDate.setUTCDate(today.getUTCDate() + 30);
    const endStr = formatDate(endDate);

    // 献立データ取得
    const mealPromise = fetch(`/api/meal-plan?from=${todayStr}&to=${endStr}`)
      .then((r) => r.json())
      .then((plans: { date: string; menu_text: string | null; schedule_text: string | null }[]) => {

        const planMap = new Map<string, { menu_text: string | null; schedule_text: string | null }>();
        for (const plan of plans) {
          const d = new Date(plan.date);
          const key = d.toISOString().slice(0, 10);
          planMap.set(key, plan);
        }

        const newDays: DayData[] = [];
        for (let i = 0; i <= 30; i++) {
          const date = new Date(today.getTime());
          date.setUTCDate(today.getUTCDate() + i);
          const dateStr = formatDate(date);
          const plan = planMap.get(dateStr);

          newDays.push({
            date: dateStr,
            dateLabel: formatDateLabel(date),
            color: getColorType(date),
            menuText: plan?.menu_text ?? "",
            scheduleText: plan?.schedule_text ?? "",
            isToday: dateStr === todayStr,
          });
        }
        return newDays;
      });

    // メモデータ取得
    const memoPromise = fetch("/api/ingredients-memo")
      .then((r) => r.json())
      .then((memo: { memo_text?: string }) => {
        return memo?.memo_text ?? "";
      });

    Promise.all([mealPromise, memoPromise])
      .then(([newDays, freshMemo]) => {
        setDays(newDays);
        setMemoText(freshMemo);
        setLoading(false);
      })
      .catch(() => {
        // エラー時は空のデータで表示
        const emptyDays: DayData[] = [];
        for (let i = 0; i <= 30; i++) {
          const date = new Date(today.getTime());
          date.setUTCDate(today.getUTCDate() + i);
          const dateStr = formatDate(date);
          emptyDays.push({
            date: dateStr,
            dateLabel: formatDateLabel(date),
            color: getColorType(date),
            menuText: "",
            scheduleText: "",
            isToday: dateStr === todayStr,
          });
        }
        setDays(emptyDays);
        setMemoText("");
        setLoading(false);
      });
  }, []);

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

  const saveCell = useCallback(
    (
      dateStr: string,
      field: "menu_text" | "schedule_text",
      value: string,
      otherValue: string
    ) => {
      const timerKey = `${dateStr}-${field}`;
      if (saveTimersRef.current[timerKey]) {
        clearTimeout(saveTimersRef.current[timerKey]);
      }
      saveTimersRef.current[timerKey] = setTimeout(() => {
        const payload = {
          date: dateStr,
          menu_text: field === "menu_text" ? value : otherValue,
          schedule_text: field === "schedule_text" ? value : otherValue,
        };
        fetch("/api/meal-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }, 300);
    },
    []
  );

  // ローディング中はバウンスドットを表示
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 48px - var(--sat))" }}>
        <div className="flex gap-2">
          <div className="bouncing-dot" style={{ animationDelay: "0s" }} />
          <div className="bouncing-dot" style={{ animationDelay: "0.15s" }} />
          <div className="bouncing-dot" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* メモエリア */}
      <div
        className="sticky z-40 bg-white px-3 py-4"
        id="memo-wrapper"
        style={{ top: "calc(var(--sat) + 48px)" }}
      >
        <div
          className="memo-area bg-white border border-gray-300 rounded-xl px-4 py-6 text-base min-h-[60px]"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const text = e.currentTarget.textContent?.trim() ?? "";
            saveMemo(text);
          }}
          ref={memoRef}
          dangerouslySetInnerHTML={{ __html: memoText ?? "" }}
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
            {(days ?? []).map((day) => (
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
                  key={`${day.date}-s-${day.scheduleText}`}
                  className="border border-gray-300 px-2 py-2"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const value = e.currentTarget.textContent?.trim() ?? "";
                    const menuTd = e.currentTarget.nextElementSibling;
                    const otherValue =
                      menuTd?.textContent?.trim() ?? day.menuText;
                    saveCell(day.date, "schedule_text", value, otherValue);
                  }}
                  dangerouslySetInnerHTML={{ __html: day.scheduleText }}
                />
                <td
                  key={`${day.date}-m-${day.menuText}`}
                  className="border border-gray-300 px-2 py-2"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const value = e.currentTarget.textContent?.trim() ?? "";
                    const scheduleTd = e.currentTarget.previousElementSibling;
                    const otherValue =
                      scheduleTd?.textContent?.trim() ?? day.scheduleText;
                    saveCell(day.date, "menu_text", value, otherValue);
                  }}
                  dangerouslySetInnerHTML={{ __html: day.menuText }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
