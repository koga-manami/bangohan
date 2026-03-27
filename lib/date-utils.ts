/**
 * 日付関連のユーティリティ関数
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 日本時間（JST）の「今日」の日付を Date オブジェクトで返す（時刻は 00:00:00 UTC） */
export function getTodayJST(): Date {
  const now = new Date();
  const jstTime = new Date(now.getTime() + JST_OFFSET_MS);
  const y = jstTime.getUTCFullYear();
  const m = jstTime.getUTCMonth();
  const d = jstTime.getUTCDate();
  return new Date(Date.UTC(y, m, d));
}

/** YYYY-MM-DD 形式にフォーマット（UTC ベース） */
export function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const WEEKDAY_NAMES = ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"];

/** M/D(曜) 形式にフォーマット（UTC ベース） */
export function formatDateLabel(date: Date): string {
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const w = WEEKDAY_NAMES[date.getUTCDay()];
  return `${m}/${d}(${w})`;
}
