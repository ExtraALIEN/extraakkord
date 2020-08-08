import re
from django import forms
from django.core.validators import RegexValidator, MinLengthValidator
from django.contrib.auth.models import User
from akkordbase.models import Artist, Song, Pick, Boi

onlychars_validator = RegexValidator(regex=re.compile('^[a-z0-9_]*$',
                                     flags=re.I),
                                     message='Допускаются только буквы \
                                     латинского алфавита(A-Z, a-z), цифры(0-9)\
                                     и знак подчеркивания(_)',
                                     code='invalid',
                                     )

charsspace_validator = RegexValidator(regex=re.compile('^[a-zа-яё0-9_ ]*$',
                                     flags=re.I),
                                     message='Допускаются только буквы \
                                     латинского или русского алфавита, \
                                     цифры, пробелы и символы _ ',
                                     code='invalid',
                                     )

class ChangePasswordForm(forms.Form):
    old_password = forms.CharField(max_length=20,
                                   required=False,
                                   widget=forms.PasswordInput,
                                   validators=[onlychars_validator])
    new_password = forms.CharField(max_length=20,
                                   required=False,
                                   widget=forms.PasswordInput,
                                   validators=[onlychars_validator,
                                               MinLengthValidator(
                                                4,
                                                message='Минимум 4 символа')])
    new_confirm = forms.CharField(max_length=20,
                                  required=False,
                                  widget=forms.PasswordInput)

    def clean_new_password(self):
        input = self.cleaned_data['new_password']
        if len(input) == 0:
            self.add_error('new_confirm',
                           forms.ValidationError(
                            'Пароль не введен'))
        return input

    def clean_new_confirm(self):
        input = self.cleaned_data['new_confirm']
        if 'new_password' not in self.cleaned_data:
            self.add_error('new_confirm',
                           forms.ValidationError(
                            'Пароль не введен либо \
                            не соответствует требованиям'))
        elif input != self.cleaned_data['new_password']:
            self.add_error('new_confirm',
                           forms.ValidationError(
                            'Пароли не совпадают. \
                            Внимательно введите заново пароль и его повтор'))
        return input


class AddArtistForm(forms.Form):
    full_name = forms.CharField(max_length=40,
                                required=False,
                                label='Имя исполнителя или название группы:')

    def clean_full_name(self):
        input = self.cleaned_data['full_name']
        if len(input) == 0:
            self.add_error('full_name',
                           forms.ValidationError(
                            'Введите имя/название исполнителя'))
        elif Artist.objects.filter(full_name=input).exists():
            self.add_error('full_name',
                           forms.ValidationError(
                            'Данный исполнитель уже добавлен'))
        return input

    def save(self, author):
        new_artist = Artist(**self.cleaned_data)
        new_artist.added_by = author.profile
        new_artist.save()
        return new_artist


class AddSongForm(forms.Form):
    full_name = forms.CharField(max_length=40,
                                required=False,
                                label='Название песни:')

    def clean_full_name(self):
        input = self.cleaned_data['full_name']
        if len(input) == 0:
            self.add_error('full_name',
                           forms.ValidationError(
                            'Введите название песни'))
        elif Song.objects.filter(full_name=input).exists():
            self.add_error('full_name',
                           forms.ValidationError(
                            'Данная песня уже добавлена'))
        return input

    def save(self, author, artist):
        new_song = Song(**self.cleaned_data)
        new_song.added_by = author.profile
        new_song.artist = artist
        new_song.save()
        return new_song


class AddPickForm(forms.Form):
    music_data = forms.CharField(required=False,
                                 widget=forms.HiddenInput)

    def clean_full_name(self):
        input = self.cleaned_data['music_data']
        # if len(input) == 0:
        #     self.add_error('full_name',
        #                    forms.ValidationError(
        #                     'Введите название песни'))
        # elif Song.objects.filter(full_name=input).exists():
        #     self.add_error('full_name',
        #                    forms.ValidationError(
        #                     'Данная песня уже добавлена'))
        return input

    def save(self, author, song):
        new_pick = Pick(**self.cleaned_data)
        #
        new_pick.added_by = author.profile
        new_pick.song = song
        new_pick.save()
        return new_pick


class AddBoiForm(forms.Form):
    name = forms.CharField(required=False,
                           widget=forms.HiddenInput,
                           validators=[charsspace_validator])
    code = forms.CharField(required=False,
                           widget=forms.HiddenInput)
    cycle_length = forms.IntegerField(required=False,
                                      widget=forms.HiddenInput)

    def clean_name(self):
        input = self.cleaned_data['name']
        if len(input) == 0:
            self.add_error('name',
                           forms.ValidationError(
                            'Введите название боя'))
        elif Boi.objects.filter(name=input).exists():
            self.add_error('name',
                           forms.ValidationError(
                            f'{input} - такое название уже существует'))
        return input

    def clean(self):
        cycle_length = self.cleaned_data['cycle_length']
        code = self.cleaned_data['code']
        if Boi.objects.filter(code=code, cycle_length=cycle_length).exists():
            boi = Boi.objects.get(code=code, cycle_length=cycle_length)
            self.add_error('code',
                           forms.ValidationError(
                            f'Бой с таким рисунком уже есть: {boi.name}'))
        return self.cleaned_data

    def save(self):
        new_boi = Boi(**self.cleaned_data)
        new_boi.save()
        return new_boi
