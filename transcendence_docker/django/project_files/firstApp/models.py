from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
#     profile_picture = models.ImageField(
#         upload_to='profile_pics/',
#         default='profile_pics/default_profile.png'  # Ensure the path is correct
#     )
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