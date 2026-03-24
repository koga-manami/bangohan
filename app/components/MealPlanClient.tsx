"use client";

import { useCallback, useRef } from "react";

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
  const memoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

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
          dangerouslySetInnerHTML={{ __html: initialMemoText }}
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
            {initialDays.map((day) => (
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
                    const menuTd = e.currentTarget.nextElementSibling;
                    const otherValue =
                      menuTd?.textContent?.trim() ?? day.menuText;
                    saveCell(day.date, "schedule_text", value, otherValue);
                  }}
                  dangerouslySetInnerHTML={{ __html: day.scheduleText }}
                />
                <td
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
