"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface DayData {
  date: string;
  dateLabel: string;
  color: string;
  menuText: string;
  scheduleText: string;
  isToday: boolean;
}

interface MealPlanClientProps {
  initialDays: DayData[];
  initialMemoText: string;
}

export default function MealPlanClient({
  initialDays,
  initialMemoText,
}: MealPlanClientProps) {
  const [days, setDays] = useState(initialDays);
  const [memoText, setMemoText] = useState(initialMemoText);
  const memoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );
  const memoRef = useRef<HTMLDivElement>(null);

  // マウント時にAPIから最新データを取得して差分があれば更新
  useEffect(() => {
    const todayStr = initialDays.find((d) => d.isToday)?.date;
    if (!todayStr) return;

    const endDate = new Date(todayStr + "T00:00:00Z");
    endDate.setUTCDate(endDate.getUTCDate() + 30);
    const endStr = endDate.toISOString().slice(0, 10);

    Promise.all([
      fetch(`/api/meal-plan?from=${todayStr}&to=${endStr}`).then((r) =>
        r.json()
      ),
      fetch("/api/ingredients-memo").then((r) => r.json()),
    ])
      .then(([plans, memo]) => {
        // 献立データを更新
        const planMap = new Map<
          string,
          { menu_text: string | null; schedule_text: string | null }
        >();
        for (const plan of plans) {
          const d = new Date(plan.date);
          const key = d.toISOString().slice(0, 10);
          planMap.set(key, plan);
        }

        setDays((prev) =>
          prev.map((day) => {
            const plan = planMap.get(day.date);
            const newMenu = plan?.menu_text ?? "";
            const newSchedule = plan?.schedule_text ?? "";
            if (day.menuText === newMenu && day.scheduleText === newSchedule) {
              return day;
            }
            return { ...day, menuText: newMenu, scheduleText: newSchedule };
          })
        );

        // メモを更新
        const freshMemo = memo?.memo_text ?? "";
        setMemoText((prev) => {
          if (prev === freshMemo) return prev;
          // contentEditable の中身も直接更新
          if (memoRef.current) {
            memoRef.current.textContent = freshMemo;
          }
          return freshMemo;
        });
      })
      .catch(() => {
        // オフライン時などはキャッシュデータのまま表示
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
