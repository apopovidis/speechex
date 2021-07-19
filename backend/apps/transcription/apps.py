# backend/apps/transcription/apps.py
from django.apps import AppConfig


class TranscriptionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'transcription'
