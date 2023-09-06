from django.contrib import admin
from django.urls import path,include
from PMP import views
from PMP.views import MealList,UserHistoryView,MealViewSet
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'meals', MealViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',views.home, name='home'),
    path('register/', views.register_view, name='register'),
    path('mealplanneruser/', views.usermealplanner_view, name='mealplanneruser'),
    path('login/', views.login_view, name='login_view'),
    path("logout/",views.logout_view, name="logout"),
    path('login/api/meals/', MealList.as_view(), name='meal_list'),
    path('login/api/user/history/', UserHistoryView.as_view(), name='user_history'),
    path('api/', include(router.urls)),
    path('activate/<uid64>/<token>',views.activate_user, name='activate'),
    path('forget-password/',views.forget_password, name='forget_password'),
    path('change-password/<ptoken>/', views.change_password, name='change_password'),
]
  
