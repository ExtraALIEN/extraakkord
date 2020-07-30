from django.urls import path, re_path, register_converter
from . import views, converters

register_converter(converters.FullNameToSlugConverter, 'tr')

app_name = 'akkordbase'
urlpatterns = [
    path('', views.index, name='index'),
    re_path(r'^startswith\/(?P<letter>[a-zA-Zа-яА-ЯЁё]{1})\/$',
            views.artists_startswith,
            name='artists_startswith'),
    path('akkords/', views.all_artists, name='all_artists'),
    path('akkords/<tr:artist_name>/', views.artist, name='artist_page'),
    path('akkords/<tr:artist_name>/<tr:song_name>/',
         views.song,
         name='song_page'),
    path('akkords/<tr:artist_name>/<tr:song_name>/<int:pick_num>',
         views.pick,
         name='pick_page'),
    path('top/', views.top),
]
