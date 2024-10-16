from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(
            upload_to="profile_pics/",
            default='profile_pics/default_profile.png',
            blank=True,
            null=True,
    )

    def __str__(self):
        return f"{self.user.username}'s profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class MatchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    score = models.CharField(max_length=5)
    result = models.CharField(max_length=10)  # Win, Lose, or Draw
    game = models.CharField(max_length=10)

    def __str__(self):
        return f'{self.user.username} - {self.result} at {self.timestamp}'