/**
 * 日本の祝日判定ユーティリティ
 * 国民の祝日に関する法律に基づく固定祝日と振替休日を判定
 */

interface HolidayRule {
  month: number;
  day?: number;
  weekOfMonth?: number; // 第n月曜日
}

// 固定祝日
const FIXED_HOLIDAYS: HolidayRule[] = [
  { month: 1, day: 1 },   // 元日
  { month: 2, day: 11 },  // 建国記念の日
  { month: 2, day: 23 },  // 天皇誕生日
  { month: 4, day: 29 },  // 昭和の日
  { month: 5, day: 3 },   // 憲法記念日
  { month: 5, day: 4 },   // みどりの日
  { month: 5, day: 5 },   // こどもの日
  { month: 8, day: 11 },  // 山の日
  { month: 11, day: 3 },  // 文化の日
  { month: 11, day: 23 }, // 勤労感謝の日
];

// ハッピーマンデー（第n月曜日）
const HAPPY_MONDAY_HOLIDAYS: { month: number; weekOfMonth: number }[] = [
  { month: 1, weekOfMonth: 2 },  // 成人の日（1月第2月曜日）
  { month: 7, weekOfMonth: 3 },  // 海の日（7月第3月曜日）
  { month: 9, weekOfMonth: 3 },  // 敬老の日（9月第3月曜日）
  { month: 10, weekOfMonth: 2 }, // スポーツの日（10月第2月曜日）
];

function getNthMondayOfMonth(year: number, month: number, n: number): number {
  const firstDay = new Date(year, month - 1, 1);
  const firstMonday = firstDay.getDay() <= 1
    ? 1 + (1 - firstDay.getDay())
    : 1 + (8 - firstDay.getDay());
  return firstMonday + (n - 1) * 7;
}

// 春分の日（近似計算）
function getVernalEquinoxDay(year: number): number {
  return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

// 秋分の日（近似計算）
function getAutumnalEquinoxDay(year: number): number {
  return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

export function isJapaneseHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0=Sun

  // 固定祝日チェック
  for (const h of FIXED_HOLIDAYS) {
    if (h.month === month && h.day === day) return true;
  }

  // ハッピーマンデーチェック
  for (const h of HAPPY_MONDAY_HOLIDAYS) {
    if (h.month === month) {
      const nthMonday = getNthMondayOfMonth(year, month, h.weekOfMonth);
      if (day === nthMonday) return true;
    }
  }

  // 春分の日
  if (month === 3 && day === getVernalEquinoxDay(year)) return true;

  // 秋分の日
  if (month === 9 && day === getAutumnalEquinoxDay(year)) return true;

  // 振替休日（祝日が日曜の場合、翌月曜が振替休日）
  if (dayOfWeek === 1) { // 月曜日
    const yesterday = new Date(year, month - 1, day - 1);
    if (yesterday.getDay() === 0) { // 前日が日曜日
      return isJapaneseHolidayCore(yesterday);
    }
  }

  return false;
}

// 振替休日の再帰を避けるためのコア関数
function isJapaneseHolidayCore(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const h of FIXED_HOLIDAYS) {
    if (h.month === month && h.day === day) return true;
  }
  for (const h of HAPPY_MONDAY_HOLIDAYS) {
    if (h.month === month) {
      const nthMonday = getNthMondayOfMonth(year, month, h.weekOfMonth);
      if (day === nthMonday) return true;
    }
  }
  if (month === 3 && day === getVernalEquinoxDay(year)) return true;
  if (month === 9 && day === getAutumnalEquinoxDay(year)) return true;

  return false;
}

/** 日付の色タイプを取得 */
export function getColorType(date: Date): string {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || isJapaneseHoliday(date)) return "red";
  if (dayOfWeek === 6) return "blue";
  return "black";
}

/** 曜日の日本語表記 */
const WEEKDAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

export function getWeekdayName(date: Date): string {
  return WEEKDAY_NAMES[date.getDay()];
}
