from django.urls import path, register_converter
from . import views, converters

register_converter(converters.FullNameToSlugConverter, 'tr')

urlpatterns = [
    path('', views.index),
    path('akkords/', views.all_artists),
    path('akkords/<tr:artist_name>/', views.artist),
    path('akkords/<tr:artist_name>/<tr:song_name>/', views.song),
    path('akkords/<tr:artist_name>/<tr:song_name>/<int:pick_num>', views.pick),
    path('top/', views.top),
]
