from django.db import models

# Create your models here.
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        default='profile_pics/default_profile.jpg'  # Ensure the path is correct
    )

    def __str__(self):
        return f"{self.user.username}'s profile"