from django.urls import path
from rest_framework_simplejwt import views as jwt_views

from . import views

app_name = 'authentication'
urlpatterns = [
    path(
        'auth',
        views.auth,
        name='auth'
    )
]
