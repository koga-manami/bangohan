from django.urls import path

from . import views

app_name = "dinner"

urlpatterns = [
    path("", views.index, name="index"),
    path("api/dinner/save/", views.save_dinner, name="save_dinner"),
    path("api/ingredients/update/", views.update_ingredients, name="update_ingredients"),
]
