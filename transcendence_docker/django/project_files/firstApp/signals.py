from django.dispatch import Signal
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Profile
import logging
logger = logging.getLogger(__name__)


# Define a custom signal for when the user's status changes
status_change_signal = Signal()

@receiver(user_logged_in)
def handle_user_login(sender, request, user, **kwargs):
	logger.info(f"User {user.username} logged in111111.")
	profile = Profile.objects.get(user=user)
	profile.online_status = True
	profile.save()
	logger.info(f"is user {profile.user} online? status: {profile.online_status}")
	# Emit custom status change signal on login
	status_change_signal.send(sender=user.__class__, username=user.username, status="online")

@receiver(user_logged_out)
def handle_user_logout(sender, request, user, **kwargs):
	logger.info(f"User {user.username} logged out111111.")
	profile = Profile.objects.get(user=user)
	profile.online_status = False
	profile.save()
	logger.info(f"is user {profile.user} offline? status: {profile.online_status}")
	# Emit custom status change signal on logout
	status_change_signal.send(sender=user.__class__, username=user.username, status="offline")


""" @receiver(user_logged_in)
def notify_friends_online(sender, request, user, **kwargs):
	logger.info(f"User {user.username} logged in2222222.")
    # Inform all the user's friends that this user is now online
	channel_layer = get_channel_layer()
	for friend in user.friends.all():  # Assuming you have a `friends` relationship
		async_to_sync(channel_layer.group_send)(
            f"user_{friend.id}",  # Each friend has a WebSocket group
            {
                "type": "status_update",
                "username": friend.username,  # ID of the user who logged in
                "status": "online",   # The new status
            }
        ) """
