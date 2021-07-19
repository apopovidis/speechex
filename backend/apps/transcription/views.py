from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import HttpResponse
from google.cloud import speech
from google.oauth2 import service_account
import json
import os
import sys
from ...settings import PROJECT_ROOT
from ..authentication import views

# TODO: remove after testing
dirname = os.path.dirname(__file__)
filename = os.path.join(
    dirname, '{0}\\speechex\\google-speech-to-text-api-credentials.json'.format(PROJECT_ROOT))
speechToTextServiceCredentials = service_account.Credentials.from_service_account_file(
    filename)
credentials = speechToTextServiceCredentials.with_scopes(
    ["https://www.googleapis.com/auth/cloud-platform"])

googleClient = speech.SpeechClient(credentials=credentials)
googleClientConfig = speech.RecognitionConfig(
    encoding="LINEAR16",
    language_code="en-US",
)

# https://cloud.google.com/speech-to-text/docs/libraries#client-libraries-install-python


class Transcriptor:
    def __init__(self):
        self.tokenHandler = views.TokenHandler()

    def transcribe(self, request, config):
        # validate token
        err = self.tokenHandler.validate(request, config)
        if err is not None:
            return HttpResponse(json.dumps(
                {
                    "errors": err
                }), status=status.HTTP_401_UNAUTHORIZED)

        # REMOVE TEMP
        # return Response(data={'text': "1 2 3"})

        err = None

        try:
            audio = request.data.get("audio", "")
            if audio == None or audio == "" or len(audio) == 0:
                err = {"error": "cannot be empty", "field": "audio"}
        except ValueError:
            err = {"error": "could not parse audio field"}

        if err is not None:
            return HttpResponse(json.dumps(
                {
                    "errors": err
                }), status=status.HTTP_400_BAD_REQUEST)

        try:
            # prepare audio request
            audioR = speech.RecognitionAudio(content=audio.read())

            # send voice message to google speech-to-text api
            res = googleClient.recognize(
                config=googleClientConfig,
                audio=audioR
            )

            if res is not None and len(res.results)>0 and len(res.results[0].alternatives)>0:
                return Response(data={'transcript': res.results[0].alternatives[0].transcript, 'confidence': res.results[0].alternatives[0].confidence})
            else:
                return HttpResponse(json.dumps(
                {
                    "error": "could not transcribe audio, please say it again"
                }), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except:
            err = None
            if len(sys.exc_info()) > 0:
                err = sys.exc_info()[0]
            else:
                err = "could not transcribe audio, please contact admin"
            return HttpResponse(json.dumps(
                {
                    "error": err
                }), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Transcription(APIView):
    def __init__(self):

        configParser = views.ConfigParser()
        self.config = configParser.get()

    def post(self, request):
        transcriptor = Transcriptor()
        return transcriptor.transcribe(request, self.config)


transcription = Transcription.as_view()
