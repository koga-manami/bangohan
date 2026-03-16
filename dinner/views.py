import datetime
import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST

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


@require_POST
def save_dinner(request):
    """献立・用事の保存API"""
    try:
        data = json.loads(request.body)
        date_str = data.get("date")
        event = data.get("event", "")
        kondate = data.get("kondate", "")

        if not date_str:
            return JsonResponse({"status": "error", "message": "date is required"}, status=400)

        target_date = datetime.date.fromisoformat(date_str)
        dinner, _created = Dinner.objects.update_or_create(
            date=target_date,
            defaults={"event": event, "kondate": kondate},
        )
        return JsonResponse({"status": "ok", "updated_at": str(dinner.updated_at)})
    except (json.JSONDecodeError, ValueError) as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)


@require_POST
def update_ingredients(request):
    """食材メモの更新API"""
    try:
        data = json.loads(request.body)
        ingredients_text = data.get("ingredients", "")

        obj = Ingredients.objects.first()
        if obj:
            obj.ingredients = ingredients_text
            obj.save()
        else:
            obj = Ingredients.objects.create(ingredients=ingredients_text)

        return JsonResponse({"status": "ok", "updated_at": str(obj.updated_at)})
    except (json.JSONDecodeError, ValueError) as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)
