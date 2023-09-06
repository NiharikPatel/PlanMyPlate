from django.contrib.auth.tokens import PasswordResetTokenGenerator

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        # Custom logic to include user-specific data in hash value
        return str(user.pk) + str(timestamp) + str(user.email_verified)

account_activation_token = AccountActivationTokenGenerator()
