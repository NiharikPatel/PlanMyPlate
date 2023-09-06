
from rest_framework import serializers
from .models import Meal

class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = '__all__'

# class CustomUserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User 
#         fields = '__all__'