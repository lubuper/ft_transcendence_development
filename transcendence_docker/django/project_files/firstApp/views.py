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
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

# Create your views here.
from .models import *

def homepage(request):
    return render(request, 'index.html')

def lobby(request):
	return render(request, 'chat/lobby.html')

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
                color = '#00ff00'
            )
            game_customization.save()  # Save the customization entry
            return JsonResponse({'message': 'Account created successfully'}, status=200)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
@login_required
def update_profile(request):
    if request.method == 'POST':

        user = request.user
        profile = get_object_or_404(Profile, user=user)

        profile_picture = request.FILES.get('profile-picture')

        new_email = request.POST.get('email')
        old_password = request.POST.get('password')
        new_password = request.POST.get('new-password')
        new_confirm_password = request.POST.get('new-confirmPassword')

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
                    try:
                        profile.profile_picture = profile_picture
                        profile.save()
                    except ValidationError as e:
                        return JsonResponse({"error": str(e)}, status=400)

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
            friend_requests = Relationship.objects.filter(receiver__user=request.user, status='sent').values_list('sender__user__username', flat=True)
            profile = Profile.objects.get(user=request.user)
            friends_count = profile.friends.count()
            user = request.user
            game_customization = GameCustomization.objects.filter(user=request.user).values('ship', 'color')
            return JsonResponse({
            'username': user.username,
            'match_history': list(match_history),
            'friends': list(friends),
            'friends_count': friends_count,
            'game_customization': list(game_customization),
            'friend_requests': list(friend_requests)},
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
				ship = 1

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

def get_ship_and_color(request):
	if request.user.is_authenticated:
		try:
			game_customization = GameCustomization.objects.get(user=request.user)
			ship_number = game_customization.ship
			hexagon_color = game_customization.color
		except GameCustomization.DoesNotExist:
			ship_number = 1
			hexagon_color = '#00ff00'
	else:
		ship_number = 1
		hexagon_color = '#00ff00'
	return JsonResponse({
		'ship': ship_number,
		'color': hexagon_color,
	})

def get_profile_friend(request):
    if request.method == 'POST':
            data = json.loads(request.body)
            username = data.get('username')  # Retrieve the friend's username

            try:
                # Retrieve the friend's user object based on username
                friend_user = User.objects.get(username=username)

                # Fetch the friend's match history using the user's ID
                match_history = MatchHistory.objects.filter(user=friend_user).values('timestamp', 'score', 'result', 'game')
                profile = Profile.objects.get(user=friend_user)

                return JsonResponse({
                    'match_history': list(match_history),
                    'profile_picture': profile.profile_picture.url if profile.profile_picture else None},
                safe=False)

            except User.DoesNotExist:
                # Handle case where the username does not exist
                return JsonResponse({'message': 'User not found'}, status=404)
    return JsonResponse({'message': 'Invalid request'}, status=400)
