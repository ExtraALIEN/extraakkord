from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return HttpResponse('test')


def all_artists(request):
    return HttpResponse('all artists')


def artist(request, artist_name):
    return HttpResponse(artist_name)


def song(request, artist_name, song_name):
    return HttpResponse(f'{artist_name}-{song_name} all picks')


def pick(request, artist_name, song_name, pick_num):
    return HttpResponse(f'{artist_name}-{song_name}-{pick_num}')
