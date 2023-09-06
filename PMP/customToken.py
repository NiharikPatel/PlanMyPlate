from django.db import models
from PMP.models import User
from django.utils.crypto import get_random_string

class CustomToken(models.Model):
    key = models.CharField(max_length=40, primary_key=True)
    user = models.ForeignKey(User, related_name='custom_auth_tokens', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = get_random_string(40)  
            print(self.key)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.key