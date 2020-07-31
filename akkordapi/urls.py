from django.urls import path
from . import views

app_name = 'akkordapi'

urlpatterns = [
    path('test/', views.test),
    path('update_profile/<str:username>', views.update_profile, name='update_profile'),
    path('change_password/<str:username>', views.change_password, name='change_password'),
]
