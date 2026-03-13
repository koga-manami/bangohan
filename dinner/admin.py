from django.contrib import admin

from .models import Dinner, Ingredients


@admin.register(Dinner)
class DinnerAdmin(admin.ModelAdmin):
    list_display = ("date", "event", "kondate", "created_at", "updated_at")
    list_filter = ("date",)
    search_fields = ("event", "kondate")
    ordering = ("-date",)


@admin.register(Ingredients)
class IngredientsAdmin(admin.ModelAdmin):
    list_display = ("ingredients", "updated_at")
