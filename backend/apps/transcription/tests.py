import unittest
from django.test import TestCase
import json
import jwt
import hashlib
import io
import os
import base64
from ..authentication import views
from ...settings import SECRET_KEY, PROJECT_ROOT

test_users = [
    {"email": "candidate@fountech.solutions", "password": "trial2021"},
]

#WIP
class Transcription(TestCase):
    def getaccessToken(self, user):
        configParser = views.ConfigParser()
        self.config = configParser.get()
        tokenHandler = views.TokenHandler()

        res = tokenHandler.create({
            'email': user["email"],
            'password': user["password"],
        }, self.config)

        self.assertTrue("accessToken" in res)

        return res["accessToken"]

    def testTranscription(self):
        user = test_users[0]
        accessToken = self.getaccessToken(user)
        
        dirname = os.path.dirname(__file__)
        filename = os.path.join(
            dirname, '{0}\\speechex\\backend\\apps\\transcription\\test_recording.wav'.format(PROJECT_ROOT))
        with io.open(filename, "rb") as audio_file:
            audio = audio_file.read()
        
        res = self.client.post('/api/transcribe/',
                               data=json.dumps({
                                   'audio': audio
                               }),
                               content_type='application/json',
                               authentication=f'Bearer {accessToken}'
                               )
        result = json.loads(res.content)

        self.assertTrue("transcript" in result)
