from django.contrib.auth.models import User
from django.db import models
# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from django.utils.crypto import get_random_string
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    forget_password_token = models.CharField(max_length=100, default='null')
    is_email_verified = models.BooleanField(default=False)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',  # Use a unique related_name
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',  # Use a unique related_name
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    def __str__(self):
        return self.email

class Meal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1) 
    meal_type = models.CharField(max_length=50)
    date_planned = models.DateField()
    time_planned = models.TimeField()
    meal_data = models.TextField(default="Default text content")

    
