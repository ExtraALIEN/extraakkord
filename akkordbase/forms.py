from django import forms

class SignupForm(forms.Form):
    username = forms.CharField(max_length=20)
    email = forms.EmailField(max_length=20)
    password = forms.CharField(widget=forms.PasswordInput, max_length=20)

    def clean_confirm_password(self):
        print(self.cleaned_data['password'])
        print(self.cleaned_data['confirm_password'])
