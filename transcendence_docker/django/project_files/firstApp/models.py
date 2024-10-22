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
    friends = models.ManyToManyField(User, related_name="friends", blank=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    def get_friends(self):
        return self.friends.all()

    def get_friends_no(self):
        return self.friends.all().count()

    def __str__(self):
        return f"{self.user.username}"


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
    score = models.CharField(max_length=10)
    result = models.CharField(max_length=10)  # Win, Lose, or Draw
    game = models.CharField(max_length=10)

    def __str__(self):
        return f'{self.user.username} - {self.result} at {self.timestamp}'

class GameCustomization(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ship = models.IntegerField(null=False)
    color = models.CharField(max_length=10)

    def __str__(self):
        return f'{self.user.username} - {self.ship} and {self.color}'