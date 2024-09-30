from django.shortcuts import render, redirect, HttpResponse

from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password, make_password
from django.views.decorators.csrf import csrf_exempt
import json  #

# Create your views here.
from .models import *

def homepage(request):
    return render(request, 'index.html')

@login_required
def profile(request):
    user = request.user

    return JsonResponse({
        'username': user.username,
        'email': user.email,
    })

@login_required
def current_user(request):
    return JsonResponse({'username': request.user.username})

@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logged out successfully'})


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            password = data['password']

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Login successful'}, status=200)
            else:
                return JsonResponse({'message': 'Invalid credentials'}, status=400)
        except KeyError:
            return JsonResponse({'message': 'Missing fields'}, status=400)
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)

@csrf_exempt
def create_account(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirmPassword')
        captcha = data.get('captcha')

        if User.objects.filter(username=username).exists():
            return JsonResponse({'message': 'Username already exists'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already exists'}, status=400)

        if password != confirm_password:
            return JsonResponse({'message': 'Passwords do not match'}, status=400)

        else:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()  # This ensures the user is stored in the database
            return JsonResponse({'message': 'Account created successfully'}, status=200)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

@login_required
def update_profile(request):
    if request.method == 'POST':

        user = request.user

        data = json.loads(request.body)

        new_username = data.get('username')
        new_email = data.get('email')
        old_password = data.get('password')
        new_password = data.get('new-password')
        new_confirm_password = data.get('new-confirmPassword')

        if not check_password(old_password, user.password):
            return JsonResponse({'message': 'Wrong password!'}, status=400)

        if new_password != new_confirm_password:
            return JsonResponse({'message': 'New passwords do not match'}, status=400)

        if new_username and User.objects.filter(username=new_username).exists() and new_username != user.username:
            return JsonResponse({'message': 'Username already exists'}, status=400)

        if new_email and User.objects.filter(email=new_email).exists() and new_email != user.email:
            return JsonResponse({'message': 'Email already exists!'}, status=400)

        if new_username and new_username != user.username:
            user.username = new_username

        if new_email and new_email != user.email:
            user.email = new_email

        if new_password:
            user.password = make_password(new_password)  # Hash the new password

        user.save()
        return JsonResponse({'message': 'Account updated successfully'}, status=200)

    return JsonResponse({'message': 'Invalid request method'}, status=405)