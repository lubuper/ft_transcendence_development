from django.db import models
from django.contrib.auth.models import User
from firstApp.models import Profile

# Game Invitation Status Choices
STATUS_CHOICES = (
    ('sent', 'Sent'),
    ('accepted', 'Accepted'),
    ('rejected', 'Rejected'),
    ('finish', 'Finish'),
)

class GameInvitation(models.Model):
	sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='game_invites_sent')
	receiver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='game_invites_received')
	game_id = models.CharField(max_length=255)
	status = models.CharField(max_length=8, null=True, choices=STATUS_CHOICES)
	updated = models.DateTimeField(auto_now=True)
	created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.sender}-{self.receiver}-{self.game_id}-{self.status}"