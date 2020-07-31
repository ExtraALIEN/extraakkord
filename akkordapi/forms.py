import re
from django import forms
from django.core.validators import RegexValidator, MinLengthValidator
from django.contrib.auth.models import User


onlychars_validator = RegexValidator(regex=re.compile('^[a-z0-9_]*$',
                                     flags=re.I),
                                     message='Допускаются только буквы \
                                     латинского алфавита(A-Z, a-z), цифры(0-9)\
                                     и знак подчеркивания(_)',
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
