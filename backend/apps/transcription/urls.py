from django.urls import path
from . import views

app_name = 'transcription'
urlpatterns = [
    path(
        'transcribe',
        views.transcription,
        name='transcription'
    )
]