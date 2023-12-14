from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("project/<int:id>", views.project, name="project"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newProj/<str:title>", views.newProj, name="newProj"),
    path('api/save_data/<int:id>', views.save_data, name='save_data'),
    path('get_data/<int:id>/<int:version>/', views.get_data, name='get_data'),
    path('designData/<int:projectId>/<int:pumpID>/', views.designData, name='designData'),
]