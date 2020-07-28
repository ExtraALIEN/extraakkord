from django.shortcuts import render, get_list_or_404, get_object_or_404
from django.http import HttpResponse
from .models import Artist, Song, Pick

def index(request):
    latest_picks = get_list_or_404(Pick.objects.get_latest())
    return render(request, 'akkordbase/index.html', {'picks': latest_picks})

def top(request):
    popular_picks = get_list_or_404(Pick.objects.get_popular())
    return render(request, 'akkordbase/top.html', {'picks': popular_picks})

def all_artists(request):
    artists = get_list_or_404(Artist.qs.alphabet_list())
    return render(request, 'akkordbase/all_artists.html', {'artists': artists})

def artists_startswith(request, letter):
    artists = get_list_or_404(Artist.qs.startswith(letter).alphabet_list())
    return render(request, 'akkordbase/all_artists.html', {'artists': artists})


def artist(request, artist_name):
    the_artist = get_object_or_404(Artist, slug=artist_name)
    return render(request, 'akkordbase/artist.html', {'artist': the_artist})


def song(request, artist_name, song_name):
    the_artist = get_object_or_404(Artist, slug=artist_name)
    the_song = get_object_or_404(Song, artist=the_artist, slug=song_name)
    return render(request, 'akkordbase/song.html', {'song': the_song})


def pick(request, artist_name, song_name, pick_num):
    the_artist = get_object_or_404(Artist, slug=artist_name)
    the_song = get_object_or_404(Song, artist=the_artist, slug=song_name)
    the_pick = get_object_or_404(Pick, song=the_song, pick_id=pick_num)
    the_pick.increment_views()
    return render(request, 'akkordbase/pick.html', {'pick': the_pick})
