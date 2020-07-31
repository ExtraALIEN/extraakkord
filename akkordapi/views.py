from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.models import User
from .forms import ChangePasswordForm
from django.contrib.auth import authenticate, update_session_auth_hash

def test(request):
    return HttpResponse('api test')

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
            if not form.errors:
                if form.is_valid():
                    user.set_password(request.POST['new_password'])
                    user.save()
                    update_session_auth_hash(request, user)
                    return JsonResponse({'info': 'Пароль обновлен'})
            return JsonResponse({'error': [form.errors[x] for x in form.errors]})
        return JsonResponse({'error': 'Старый пароль не соответсвует пользователю'})
    return JsonResponse({'error': 'Не удалось получить данные'})
