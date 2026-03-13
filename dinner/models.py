from django.db import models


class Dinner(models.Model):
    """献立・用事テーブル"""

    dinner_id = models.AutoField(primary_key=True)
    date = models.DateField("日付", unique=True)
    event = models.CharField("用事", max_length=50, blank=True, default="")
    kondate = models.CharField("献立", max_length=256, blank=True, default="")
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        db_table = "dinner"
        ordering = ["-date"]
        verbose_name = "献立"
        verbose_name_plural = "献立"

    def __str__(self):
        return f"{self.date} {self.kondate}"


class Ingredients(models.Model):
    """残りの食材メモテーブル（1レコードのみ）"""

    ingredients = models.CharField("残りの食材", max_length=256, blank=True, default="")
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        db_table = "ingredients"
        verbose_name = "食材メモ"
        verbose_name_plural = "食材メモ"

    def __str__(self):
        return self.ingredients
