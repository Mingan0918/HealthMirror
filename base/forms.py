from django import forms
from .models import User
from django.contrib.auth.forms import UserCreationForm


class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=False)
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput)
    gender = forms.ChoiceField(choices=[('male', 'Male'), ('female', 'Female')], required=False)
    phone = forms.CharField(max_length=15, required=False, help_text='For example, +60123456789')

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', 
                  'gender', 'phone')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.gender = self.cleaned_data['gender']
        user.phone = self.cleaned_data['phone']

        if commit:
            user.save()

        return user
