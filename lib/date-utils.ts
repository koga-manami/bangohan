/**
 * 日付関連のユーティリティ関数
 */

/** YYYY-MM-DD 形式にフォーマット */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const WEEKDAY_NAMES = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];

/** M/D(曜) 形式にフォーマット */
export function formatDateLabel(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = WEEKDAY_NAMES[date.getDay()];
  return `${m}/${d}(${w})`;
}
