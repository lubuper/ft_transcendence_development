from django.shortcuts import render
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import GameInvitation
from firstApp.models import Profile
import json
import random
import logging
logger = logging.getLogger(__name__)

@csrf_exempt
def send_game_invitation(request):
    if request.method == 'POST':
        # Parse the JSON body
        data = json.loads(request.body)
        sender = request.user  # User who is sending the invitation
        receiver_username = data.get('username')  # Extract username from JSON
        game_name = data.get('game_name')  # Game name from the invitation
        random_number = random.randint(100, 999)
        game_id = f"{game_name}{random_number}"

        # Check if the receiver username and game name are provided
        if not receiver_username or not game_name:
            return JsonResponse({'error': 'Username and game name are required'}, status=400)

        # Find the receiver user and create a game invitation
        try:
            receiver = Profile.objects.get(user__username=receiver_username)

            # Create a game invitation instance with status 'sent'
            game_invitation, created = GameInvitation.objects.update_or_create(
                sender=Profile.objects.get(user=sender),
                receiver=receiver,
                game_id=game_id,
                status='sent'
            )
            if created:
                return JsonResponse({'message': f'Game invitation sent successfully!', 'game_id': game_invitation.game_id }, status=200)
            else:
                return JsonResponse({'message': f'Game invitation already sent!'}, status=400)

        except Profile.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)

    return JsonResponse({'message': 'Invalid request'}, status=400)


@csrf_exempt
def accept_game_invitation(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        sender_username = data.get('username')
        game_id = data.get('game_id')
        receiver_username = request.user

        try:
            receiver = request.user.profile  # Current user (receiver)
            sender = Profile.objects.get(user__username=sender_username)  # Sender of the invitation
            # Update the GameInvitation model to set status to 'accepted'
            game_invitation = GameInvitation.objects.get(
                sender=sender,
                receiver=receiver,
                game_id=game_id,
                status='sent'
            )
            game_invitation.status = 'accepted'
            game_invitation.save()

            return JsonResponse({'message': f'Game invitation accepted successfully!', 'game_id': game_invitation.game_id }, status=200)
        except Profile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except GameInvitation.DoesNotExist:
            return JsonResponse({'error': 'Game invitation not found'}, status=404)

    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
def reject_game_invitation(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        game_id = data.get('game_id')

        try:
            receiver = request.user.profile  # Current user (receiver)
            sender = Profile.objects.get(user__username=username)  # Sender of the invitation

            # Attempt to get the existing game invitation
            game_invitation = GameInvitation.objects.get(
                sender=sender,
                receiver=receiver,
                game_id=game_id,
                status='sent'
            )

            # Update the GameInvitation model to set status to 'rejected'
            game_invitation.status = 'rejected'
            game_invitation.save()

            return JsonResponse({'message': f'Game invitation rejected successfully!', 'game_id': game_invitation.game_id }, status=200)
        except Profile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except GameInvitation.DoesNotExist:
            return JsonResponse({'error': 'Game invitation not found'}, status=404)

    return JsonResponse({'error': 'Invalid request'}, status=400)
