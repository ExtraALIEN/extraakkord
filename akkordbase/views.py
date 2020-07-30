from django.shortcuts import render, get_list_or_404, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.urls import reverse
from .models import Artist, Song, Pick
from .forms import SignupForm


def index(request):
    latest_picks = Pick.objects.get_latest()
    return render(request, 'akkordbase/index.html', {'picks': latest_picks})


def top(request):
    popular_picks = Pick.objects.get_popular()
    return render(request, 'akkordbase/top.html', {'picks': popular_picks})


def all_artists(request):
    artists = Artist.qs.alphabet_list()
    return render(request, 'akkordbase/all_artists.html', {'artists': artists})


def artists_startswith(request, letter):
    artists = Artist.qs.startswith(letter).alphabet_list()
    return render(request, 'akkordbase/all_artists.html', {'artists': artists,
                                                           'letter': letter})


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


def signup(request):
    if request.method == 'POST':
        form = SignupForm(data=request.POST)
        if form.is_valid():
            print('form valid')
            new_user = User.objects.create_user(**form.cleaned_data)
            auth_login(request, user)
            return HttpResponseRedirect(reverse('akkordbase:index'))
    else:
        form = SignupForm()
    return render(request, 'akkordbase/signup.html', {'form': form})


def logout(request):
    auth_logout(request)
    return HttpResponseRedirect(reverse('akkordbase:index'))
