from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("project/<int:id>", views.project, name="project"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newProj/<str:title>", views.newProj, name="newProj"),
]