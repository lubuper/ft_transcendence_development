from django.shortcuts import render, redirect, HttpResponse

from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password, make_password
from django.views.decorators.csrf import csrf_exempt
import json  #
from .models import Profile, MatchHistory, GameCustomization
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import sys
from django.db import IntegrityError
from django.views.decorators.http import require_POST
from friends.models import Relationship

# Create your views here.
from .models import *

def homepage(request):
    return render(request, 'index.html')

@login_required
def profile(request):
    user = request.user
    try:
        profile = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        return JsonResponse({'message': 'Profile does not exist'}, status=404)

        # Construct the absolute URL for the profile picture
    profile_picture_url = profile.profile_picture.url if profile.profile_picture else None

    return JsonResponse({
            'username': user.username,
            'email': user.email,
            'profile_picture': profile_picture_url,
    })

@login_required
def current_user(request):
    user = request.user
    profile = Profile.objects.get(user=user)
    return JsonResponse({
        'username': user.username,
#         'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
        'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
    })

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

        if User.objects.filter(username=username).exists():
            return JsonResponse({'message': 'Username already exists'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already exists'}, status=400)

        if password != confirm_password:
            return JsonResponse({'message': 'Passwords do not match'}, status=400)

        else:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()  # This ensures the user is stored in the database

            game_customization = GameCustomization.objects.create(
            	user=user,
                ship = 1,
                color = '0x00ff00'
            )
            game_customization.save()  # Save the customization entry
            return JsonResponse({'message': 'Account created successfully'}, status=200)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
@login_required
def update_profile(request):
    if request.method == 'POST':

        user = request.user

        data = json.loads(request.body)

        profile_picture = request.FILES.get('profile-picture')

        new_email = data.get('email')
        old_password = data.get('password')
        new_password = data.get('new-password')
        new_confirm_password = data.get('new-confirmPassword')

        if not check_password(old_password, user.password):
            return JsonResponse({'message': 'Wrong password!'}, status=400)

        if new_password != new_confirm_password:
            return JsonResponse({'message': 'New passwords do not match'}, status=400)

        if new_email and User.objects.filter(email=new_email).exists() and new_email != user.email:
            return JsonResponse({'message': 'Email already exists!'}, status=400)

        if new_email and new_email != user.email:
            user.email = new_email

        if new_password:
            user.password = make_password(new_password)  # Hash the new password

        if profile_picture:
                    profile, created = Profile.objects.get_or_create(user=user)
                    if profile.profile_picture and profile.profile_picture.name != 'profile_pics/default_profile.png':
                        if os.path.isfile(profile.profile_picture.path):
                            os.remove(profile.profile_picture.path)
                    profile.profile_picture = profile_picture
                    profile.save()

        user.save()

        return JsonResponse({'message': 'Account updated successfully'}, status=200)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

@require_POST
@login_required
def save_match_history(request):
	if request.method == 'POST':
            try:
                # Parse JSON request body
                data = json.loads(request.body)

                # Create a new MatchHistory entry
                match = MatchHistory.objects.create(
                    user=request.user,
                    score=data['score'],
                    result=data['result'],
                    game=data['game']
                )

                # Return a success response
                return JsonResponse({'message': 'Match history saved successfully'}, status=200)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
	else:
            # Handle invalid request methods
            return JsonResponse({'error': 'Invalid request method'}, status=405)


@login_required
def load_match_history(request):
    try:
            match_history = MatchHistory.objects.filter(user=request.user).values('timestamp', 'score', 'result', 'game')
            friends = Profile.objects.filter(user=request.user).values_list('friends__username', flat=True)
            profile = Profile.objects.get(user=request.user)
            friends_count = profile.friends.count()
            user = request.user
            game_customization = GameCustomization.objects.filter(user=request.user).values('ship', 'color')
            return JsonResponse({
            'username': user.username,
            'match_history': list(match_history),
            'friends': list(friends),
            'friends_count': friends_count,
            'game_customization': list(game_customization)},
            safe=False)
    except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)  # Return error as JSON

@login_required
def save_customization(request):
	if request.method == 'POST':
		try:
			# Load JSON data from the request body
			data = json.loads(request.body)

			user = request.user
			ship = data.get('ship')  # Get the ship ID from the JSON data
			color = data.get('color')  # Get the color from the JSON data

			# Check if the ship value is valid
			if not ship:
				return JsonResponse({'error': 'Ship ID is missing.'}, status=400)

			# Validate and convert the ship to an integer
			try:
				ship = int(ship)
			except ValueError:
				 return JsonResponse({'error': 'Invalid ship ID.'}, status=400)

			# Update or create the GameCustomization for the user
			customization, created = GameCustomization.objects.update_or_create(
				user=user,
				defaults={'ship': ship, 'color': color},
			)
			return JsonResponse({'status': 'success', 'message': 'Customization saved.'})
		except json.JSONDecodeError:
			return JsonResponse({'error': 'Invalid JSON.'}, status=400)