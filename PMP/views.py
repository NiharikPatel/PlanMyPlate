from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render,redirect
from .models import Meal
from django.http import JsonResponse
from django.views import View
from django.http import HttpResponse
import csv
from django.contrib.auth import login,logout
from django.contrib.auth.hashers import check_password
from django.contrib import messages
from .forms import RegistrationForm 
from django.contrib.auth.decorators import login_required
from PMP.customTokenAuth import CustomTokenAuthentication
from rest_framework.permissions import IsAuthenticated
from PMP.customToken import CustomToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from .serializers import MealPlanSerializer
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from PMP.models import User
from PMP.utils import generate_token
from django.core.mail import EmailMessage
from django.conf import settings
from smtplib  import SMTPException
from PMP.helpers import send_forget_password_mail
import uuid
import os
from django.template import Context
# from decouple import config

#function for sending the email to registered email id

def send_action_email(user,request):
    current_site = get_current_site(request)
    email_subject = 'Activate your account'
    email_body =  render_to_string ('activate.html',{
        'user': user,
        'domain':current_site.domain,
        'uid64': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': generate_token.make_token(user),   
    })
    try:
        email = EmailMessage(subject=email_subject,
                             body=email_body,
                             from_email=settings.EMAIL_FROM_USER,
                             to=[user.email]) 
        email.send()
        print("Email sent successfully")

    except SMTPException as e:
        print(f"Email sending failed: {e}") 

#function for changing is_email_verified to true
def activate_user(request, uid64, token) :
    try:
        uid = force_str(urlsafe_base64_decode(uid64))
        user = User.objects.get(pk = uid) 

    except Exception as e:
        user = None
    if user and generate_token.check_token(user,token):
        user.is_email_verified =True
        user.save()
        messages.success(request,'Email verified, you can now login')
        return redirect('home')
    return render(request,'activate-failed.html',{"user":user})


#registration page for registering the user and sending the verification link to the user
#     
def register_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        
        if form.is_valid():
            user = form.save()
            send_action_email(user, request)
            login(request, user)
            messages.success(request, f'{user.username}, We have sent you mail, please verify your account.!')
            return redirect('home') 
    else:
            print("there is error")
            form = RegistrationForm()
    return render(request, 'register.html', {'form': form})

#authentication function for custom user model
def authenticate(username=None, password=None):
    try:
        user = User.objects.get(username = username)
        if check_password(password, user.password):
            return user
    
    except User.DoesNotExist:
        return None
    
#login view which check whether the email is verified or not then login the page 
# and a token generator for writing or reading the api 

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']  
        password = request.POST['password'] 
        user = authenticate(username=username, password=password)
        api_key = os.environ.get('API_KEY')
        
        if user is not None:
            if not user.is_email_verified:
                messages.error(request, 'Please verify your email.Check your inbox or spam')
                return redirect('home')
            else:
                login(request, user)
                token = generate_token_response(user)  
                context = {'token':token,'api_key':api_key}
                print(context)
                return render(request,'mealplanneruser.html',context)
            
        else:
            print("username password not matched")
            messages.error(request, 'Invalid email or password.')
            return redirect('home')
    else:
        return render(request,'index.html')

#creating custom token in custom token model for accessing the api(user as foreign key)

def generate_token_response(user):
    token, _ = CustomToken.objects.get_or_create(user=user)
    return token.key

class MealViewSet(viewsets.ModelViewSet):
     queryset = Meal.objects.all()
     serializer_class = MealPlanSerializer

@login_required
def usermealplanner_view(request):
    api_key = os.environ.get('API_KEY')        
    return render(request, 'mealplanneruser.html',{'api_key':api_key})

#class for saving the meal plan in meal model
class MealList(APIView):
    default_authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated] 
    def post(self, request):
        user = request.user
        meal_type = request.data.get('meal_type')
        date_planned = request.data.get('date_planned')
        time_planned = request.data.get('time_planned')
        meal_data = request.data.get('meal_data')  # This will be a list of meal details

        meal = Meal(
            user = user,
            meal_type=meal_type,
            date_planned=date_planned,
            time_planned=time_planned,
            meal_data=meal_data
        )
        meal.save()

        return Response({'message': 'Meals stored successfully'}, status=status.HTTP_201_CREATED)

#class for showing the saved meal plan of meal model
   
class UserHistoryView(View):
    def get(self, request):
            user = request.user 
            user_meals = Meal.objects.filter(user=user)
            meal_history = [{'date_planned':meal.date_planned,'time_planned':meal.time_planned,'meal_type':meal.meal_type,'meal_data':meal.meal_data} for meal in user_meals] 
            return JsonResponse({'success': True, 'meal_history': meal_history})
    
#function for exporting the table
def export_table_to_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=table.csv'

    # Create a CSV writer
    csv_writer = csv.writer(response)
    
    # Write the header
    csv_writer.writerow(['Date', 'Time', 'Meal Type', 'List of meals'])
    
    # Write your data rows here...
    
    return response

#function for logging out the user profile
def logout_view(request):
    logout(request) 
    return redirect('home')   

def change_password(request, ptoken):
    context = {}
    try:
        user_obj = User.objects.get(forget_password_token = ptoken)
        context = {'user_id': user_obj.id}

        if request.method == 'POST':
            new_password = request.POST.get('newpassword1')
            confirm_password = request.POST.get('newpassword2')
            user_id = request.POST.get('user_id')
            if user_id is None:
                messages.error(request, 'No user_id found')
                return redirect(f'/change-password/{ptoken}')
            
            if new_password != confirm_password:
                messages.error(request, 'Both password not matched')
                return redirect(f'/change-password/{ptoken}')  
                         
       
            user_obj = User.objects.get(id = user_id)
            user_obj.set_password(new_password)
            user_obj.save()
            messages.success(request, 'Your password changed successfully.')
            return redirect('/logout/')



        

    except Exception as e:
        print(e)
    return render(request, 'change-password.html', context)

def forget_password(request):
    try:
        if request.method == 'POST':
            username = request.POST.get('username')
            if not User.objects.filter(username = username):
                messages.error(request,'No user found with this username')
                return redirect('forget_password')
            
            user_obj = User.objects.get(username=username)
            ptoken = str(uuid.uuid4())
            user_obj.forget_password_token = ptoken
            user_obj.save()
            send_forget_password_mail(user_obj, ptoken, request)
            messages.success(request, "link sent to your registered mail for password reset")
            return redirect('/forget-password/')
 
    except Exception as e:
        print(e)
    

    return render(request, 'forget-password.html')

def home(request):
    api_key = os.environ.get('API_KEY')
    return render(request,'index.html',{'api_key':api_key})
