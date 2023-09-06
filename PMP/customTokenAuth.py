from rest_framework.authentication import TokenAuthentication
from PMP.customToken import CustomToken

class CustomTokenAuthentication(TokenAuthentication):
    model = CustomToken