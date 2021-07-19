from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth.models import User
from django.shortcuts import HttpResponse
import http.client
import json
import re
import jwt
import hashlib
import datetime
import threading
import uuid
import random
import sys
import os
from ...settings import SECRET_KEY, PROJECT_ROOT

EMAIL_REGEX = re.compile(
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')

# https://stackoverflow.com/questions/6760685/creating-a-singleton-in-python


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            lock = threading.Lock()
            with lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super(
                        Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class ConfigParser(metaclass=Singleton):
    def get(self):
        try:
            dirname = os.path.dirname(__file__)
            filename = os.path.join(
                dirname, '{0}\\speechex\\backend\\config.json'.format(PROJECT_ROOT))
            with open(filename) as config_file:
                return json.load(config_file)
        except:
            return {"error": sys.exc_info()[0]}


class InputValidator:
    def validate(self, request, config):
        err = self.validateEmail(request, config)
        if err is not None:
            return err

        err = self.validatePassword(request, config)
        if err is not None:
            return err

        return None

    def validateEmail(self, request, config):
        try:
            value = request.data.get("email")
            if value is None or value.strip() == "":
                return {"error": "cannot be empty", "field": "email"}

            if (not re.match(EMAIL_REGEX, value)):
                return {"error": "invalid", "field": "email"}

        except:
            return {"error": sys.exc_info()[0]}

    def validatePassword(self, request, config):
        try:
            value = request.data.get("password")
            if value is None or value.strip() == "":
                return {"error": "cannot be empty", "field": "password"}

            minPasswordLength = config["validations"]["password"]["length"]["min"]
            maxPasswordLength = config["validations"]["password"]["length"]["max"]

            if len(value) < minPasswordLength:
                return {"error": "must be at least {} characters long".format(minPasswordLength), "field": "password"}

            if len(value) > maxPasswordLength:
                return {"error": "must be at most {} characters long".format(maxPasswordLength), "field": "password"}

            return None

        except:
            return {"error": sys.exc_info()[0]}


class ModelValidator:
    def validate(self, request, config):
        try:
            # load user from configuration file
            email = request.data.get("email")
            password = request.data.get("password")

            # loop through the users object to see if we have a matching user
            found = False
            if "users" in config:
                for user in config["users"]:
                    if user["email"] == email and user["password"] == password:
                        found = True

            if found == False:
                return {"error": "access is denied"}

            return None

        except Exception:
            return {"error": sys.exc_info()[0]}


class TokenHandler:
    def create(self, request, config):
        try:
            expirationTimeInMinutes = config["accessToken"]["expirationTimeInMinutes"]
        
            timeNow = datetime.datetime.utcnow()
          
            userId = config["users"][0]["userId"]

            jwtTokenBody = {
                "jti": str(uuid.uuid4()),
                "email": request["email"],
                "iat": timeNow,
                "exp": timeNow+datetime.timedelta(minutes=expirationTimeInMinutes),
                "token_type": "access",
                "user_id": userId,
            }
           
            return {
                "accessToken": jwt.encode(jwtTokenBody, SECRET_KEY, algorithm='HS256')
            }
        except:
            return {"error": sys.exc_info()[0]}

    def validate(self, request, config):
        try:
            token = request.headers["authorization"]
            if token is None or token.strip() == "" or len(token) == 0:
                return [{"error": "invalid access token"}]

            token = token.split("Bearer ", 1)[1]

            accessToken = jwt.decode(
                token, SECRET_KEY, algorithms='HS256')

            email = accessToken.get("email")
            exp = accessToken.get("exp")

            if datetime.datetime.utcnow().timestamp() > exp:
                return {"error": "access token expired"}

            found = False
            if "users" in config:
                for user in config["users"]:
                    if user["email"] == email:
                        found = True

            if found == False:
                return {"error": "access token is not unauthorized"}

            return None
        except:
            return {"error": sys.exc_info()[0]}


class Authorizator:
    def __init__(self):
        self.inputValidator = InputValidator()
        self.modelValidator = ModelValidator()
        self.tokenHandler = TokenHandler()

    def authorize(self, request, config):
        # input validations
        err = self.inputValidator.validate(request, config)
        if err is not None:
            return HttpResponse(json.dumps(
                {
                    "errors": err
                }), status=status.HTTP_400_BAD_REQUEST)
        
        # model validations
        err = self.modelValidator.validate(request, config)
        if err is not None:
            return HttpResponse(json.dumps(
                {
                    "errors": err
                }), status=status.HTTP_401_UNAUTHORIZED)

        res = self.tokenHandler.create({
            "email": request.data.get("email"),
            "password": request.data.get("password")
        }, config)
        if "error" in res:
            return HttpResponse(json.dumps(
                {
                    "errors": res
                }), status=status.HTTP_400_BAD_REQUEST)

        # token creation
        return Response(data={'accessToken': res["accessToken"]})


class Auth(APIView):
    def __init__(self):
        configParser = ConfigParser()
        self.config = configParser.get()

    def post(self, request):
        authorizator = Authorizator()
        return authorizator.authorize(request, self.config)

auth = Auth.as_view()
