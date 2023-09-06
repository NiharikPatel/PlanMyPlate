from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site

def send_forget_password_mail(email, ptoken, request):
    current_site = get_current_site(request)
    subject = 'Your forget password link'
    reset_password_url = reverse('change_password', kwargs={'ptoken': ptoken})
    domain = current_site.domain
    full_url = f'//{domain}{reset_password_url}'
    message = f'Hi, click on the link to reset your password {full_url}'
    email_from = settings.EMAIL_HOST_USER
    recepient_list = [email]
    send_mail(subject, message, email_from, recepient_list)
    return True