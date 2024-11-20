from django.shortcuts import render
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import GameInvitation
from firstApp.models import Profile
import json

@csrf_exempt
def send_game_invitation(request):
    if request.method == 'POST':
        # Parse the JSON body
        data = json.loads(request.body)
        sender = request.user  # User who is sending the invitation
        receiver_username = data.get('username')  # Extract username from JSON
        game_name = data.get('game_name')  # Game name from the invitation

        # Check if the receiver username and game name are provided
        if not receiver_username or not game_name:
            return JsonResponse({'error': 'Username and game name are required'}, status=400)

        # Find the receiver user and create a game invitation
        try:
            receiver = Profile.objects.get(user__username=receiver_username)

            # Create a game invitation instance with status 'sent'
            game_invitation, created = GameInvitation.objects.get_or_create(
                sender=Profile.objects.get(user=sender),
                receiver=receiver,
                game_id=game_name,
                defaults={'status': 'sent'}
            )

            if created:
                return JsonResponse({'message': f'Game invitation for {game_name} sent successfully!'}, status=200)
            else:
                return JsonResponse({'message': f'Game invitation already sent for {game_name}!'}, status=400)

        except Profile.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)

    return JsonResponse({'message': 'Invalid request'}, status=400)


@csrf_exempt
def accept_game_invitation(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        game_name = data.get('game_name')

        try:
            receiver = request.user.profile  # Current user (receiver)
            sender = Profile.objects.get(user__username=username)  # Sender of the invitation

            # Update the GameInvitation model to set status to 'accepted'
            game_invitation = GameInvitation.objects.get(
                sender=sender,
                receiver=receiver,
                game_id=game_name,
                status='sent'
            )
            game_invitation.status = 'accepted'
            game_invitation.save()

            return JsonResponse({'message': f'Game invitation for {game_name} accepted successfully!'}, status=200)
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
        game_name = data.get('game_name')

        try:
            receiver = request.user.profile  # Current user (receiver)
            sender = Profile.objects.get(user__username=username)  # Sender of the invitation

            # Attempt to get the existing game invitation
            game_invitation = GameInvitation.objects.get(
                sender=sender,
                receiver=receiver,
                game_id=game_name,
                status='sent'
            )

            # Update the GameInvitation model to set status to 'rejected'
            game_invitation.status = 'rejected'
            game_invitation.save()

            return JsonResponse({'message': f'Game invitation for {game_name} rejected successfully!'}, status=200)
        except Profile.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except GameInvitation.DoesNotExist:
            return JsonResponse({'error': 'Game invitation not found'}, status=404)

    return JsonResponse({'error': 'Invalid request'}, status=400)
