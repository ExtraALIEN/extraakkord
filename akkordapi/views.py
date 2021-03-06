from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.models import User
from .forms import ChangePasswordForm, AddArtistForm, AddSongForm, AddPickForm, AddBoiForm
from django.contrib.auth import authenticate, update_session_auth_hash
from akkordbase.models import Artist

def test(request):
    return render(request, 'akkordbase/test.html')

def update_profile(request, username):
    if request.method == 'POST' and request.user.username == username:
        location = request.POST['location']
        bio = request.POST['bio']
        the_user = User.objects.get(username=username)
        the_user.profile.location = location[:20]
        the_user.profile.bio = bio[:400]
        the_user.profile.save()
        return HttpResponseRedirect(reverse('akkordbase:profile', args=(username,)))
    return HttpResponseRedirect(reverse('akkordbase:index'))


def change_password(request, username):
    if request.method == 'POST' and request.user.username == username:
        old = request.POST['old_password']
        user = authenticate(username=username, password=old)
        if user is not None:
            form = ChangePasswordForm(request.POST)
            if form.is_valid():
                user.set_password(request.POST['new_password'])
                user.save()
                update_session_auth_hash(request, user)
                return JsonResponse({'info': 'Пароль обновлен'})
            return JsonResponse({'error': [form.errors[x] for x in form.errors]})
        return JsonResponse({'error': 'Старый пароль не соответсвует пользователю'})
    return JsonResponse({'error': 'Не удалось получить данные'})


def add_artist(request):
    if request.method == 'POST' and request.user is not None:
        form = AddArtistForm(request.POST)
        if form.is_valid():
            new_artist = form.save(request.user)
            return JsonResponse({'info': f'{new_artist} - исполнитель добавлен'})
        return JsonResponse({'error': [form.errors[x] for x in form.errors]})
    return JsonResponse({'error': 'Не удалось получить данные'})


def add_song(request, artist_name):
    if request.method == 'POST' and request.user is not None:
        form = AddSongForm(request.POST)
        the_artist = Artist.objects.get(slug=artist_name)
        if form.is_valid():
            new_song = form.save(request.user, the_artist)
            return JsonResponse({'info': f'{the_artist} - {new_song} песня добавлена'})
        return JsonResponse({'error': [form.errors[x] for x in form.errors]})
    return JsonResponse({'error': 'Не удалось получить данные'})


def add_pick(request, artist_name, song_name):
    if request.method == 'POST' and request.user is not None:
        print(request.POST)
        form = AddPickForm(request.POST)
        the_artist = Artist.objects.get(slug=artist_name)
        the_song = the_artist.songs.get(slug=song_name)
        if form.is_valid():
            new_pick = form.save(request.user, the_song)
            return JsonResponse({'info': 'Подбор добавлен'})
        return JsonResponse({'error': [form.errors[x] for x in form.errors]})
    return JsonResponse({'error': 'Не удалось получить данные'})


def add_boi(request):
    if request.method == 'POST' and request.user is not None:
        form = AddBoiForm(request.POST)
        if form.is_valid():
            new_boi = form.save()
            return JsonResponse({'info': f'Бой добавлен: {new_boi.name}'})
        return JsonResponse({'error': [form.errors[x] for x in form.errors]})
    return JsonResponse({'error': 'Не удалось получить данные'})
