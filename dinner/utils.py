import datetime

import holidays


# 日本の祝日カレンダー
_jp_holidays = holidays.Japan()


def is_japanese_holiday(target_date: datetime.date) -> bool:
    """指定した日付が日本の祝日かどうかを判定する。"""
    return target_date in _jp_holidays


def get_color_type(target_date: datetime.date) -> str:
    """
    日付に応じた表示色を返す。
    - 日曜日・祝日 → "red"
    - 土曜日 → "blue"
    - それ以外 → "black"
    """
    if target_date.weekday() == 6 or is_japanese_holiday(target_date):
        return "red"
    if target_date.weekday() == 5:
        return "blue"
    return "black"
