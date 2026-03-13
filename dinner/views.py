import datetime

from django.shortcuts import render

from .models import Dinner, Ingredients
from .utils import get_color_type, is_japanese_holiday

# 曜日の日本語表記
WEEKDAY_NAMES = ["月", "火", "水", "木", "金", "土", "日"]


def index(request):
    """メイン画面: 当日を基準に前後2週間の献立リストを表示する。"""
    today = datetime.date.today()
    start_date = today
    end_date = today + datetime.timedelta(days=14)

    # 期間内の既存レコードを取得して辞書化
    existing = Dinner.objects.filter(date__gte=start_date, date__lte=end_date)
    dinner_map = {d.date: d for d in existing}

    # 日付リストを生成（当日が先頭、昇順）
    days = []
    for i in range((end_date - start_date).days + 1):
        current_date = start_date + datetime.timedelta(days=i)
        dinner = dinner_map.get(current_date)
        color = get_color_type(current_date)
        weekday = WEEKDAY_NAMES[current_date.weekday()]
        days.append({
            "date": current_date,
            "weekday": weekday,
            "date_label": f"{current_date.month}/{current_date.day}({weekday})",
            "event": dinner.event if dinner else "",
            "kondate": dinner.kondate if dinner else "",
            "color": color,
            "is_holiday": is_japanese_holiday(current_date),
        })

    # 食材メモの最新1件を取得
    ingredients_obj = Ingredients.objects.order_by("-updated_at").first()
    ingredients_text = ingredients_obj.ingredients if ingredients_obj else ""

    context = {
        "days": days,
        "ingredients": ingredients_text,
        "today": today,
    }
    return render(request, "dinner/index.html", context)
