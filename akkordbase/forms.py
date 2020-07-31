import re
from django import forms
from django.db.utils import IntegrityError
from django.core.validators import RegexValidator, MinLengthValidator
from django.contrib.auth.models import User

onlychars_validator = RegexValidator(regex=re.compile('^[a-z0-9_]*$',
                                     flags=re.I),
                                     message='Допускаются только буквы \
                                     латинского алфавита(A-Z, a-z), цифры(0-9)\
                                     и знак подчеркивания(_)',
                                     code='invalid',
                                     )

firstchar_validator = RegexValidator(regex=re.compile('^[a-z]',
                                     flags=re.I),
                                     message='Должно начинаться с буквы \
                                     латинского алфавита(A-Z, a-z)',
                                     code='invalid',
                                     )


class LoginForm(forms.Form):
    username = forms.CharField(max_length=20,
                               required=False,
                               )
    password = forms.CharField(max_length=20,
                               required=False,
                               widget=forms.PasswordInput,
                               )


class SignupForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super(SignupForm, self).__init__(*args, **kwargs)
        for field in self.fields.values():
            field.error_messages = {'required': 'Обязательное поле'}

    username = forms.CharField(max_length=20,
                               validators=[onlychars_validator,
                                           firstchar_validator,
                                           MinLengthValidator(
                                            4,
                                            message='Минимум 4 символа')])
    email = forms.EmailField(max_length=20)
    password = forms.CharField(max_length=20,
                               widget=forms.PasswordInput,
                               validators=[onlychars_validator,
                                           MinLengthValidator(
                                            4,
                                            message='Минимум 4 символа')])

    confirm_password = forms.CharField(max_length=20,
                                       widget=forms.PasswordInput,
                                       validators=[onlychars_validator])

    def clean_username(self):
        input = self.cleaned_data['username']
        if User.objects.filter(username=input).exists():
            self.add_error('username',
                           forms.ValidationError(
                            'Такое имя пользователя уже существует. \
                            Выберите другое имя пользователя'))
        return input

    def clean_email(self):
        input = self.cleaned_data['email']
        if User.objects.filter(email=input).exists():
            self.add_error('email',
                           forms.ValidationError(
                            'Адрес электронной почты уже существует. \
                            Выберите другой email'))
        return input

    def clean_confirm_password(self):
        input = self.cleaned_data['confirm_password']
        if 'password' not in self.cleaned_data:
            self.add_error('confirm_password',
                           forms.ValidationError(
                            'Пароль не введен либо \
                            не соответствует требованиям'))
        elif input != self.cleaned_data['password']:
            self.add_error('confirm_password',
                           forms.ValidationError(
                            'Пароли не совпадают. \
                            Внимательно введите заново пароль и его повтор'))
        return input

    def save(self):
        del self.cleaned_data['confirm_password']
        new_user = User(**self.cleaned_data)
        new_user.save()
        return new_user
