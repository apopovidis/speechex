import unittest
from django.test import TestCase
import json

test_users = [
    {"email": "candidate@fountech.solutions", "password": "trial2021"},
]

#WIP
class AuthTest(TestCase):
    def test_auth_with_valid_credentials(self):
        user = test_users[0]
        res = self.client.post('/api/auth/',
                               data=json.dumps({
                                   'email': user["email"],
                                   'password': user["password"],
                               }),
                               content_type='application/json',
                               )
        result = json.loads(res.content)
        self.assertTrue("accessToken" in result)

if __name__ == '__main__':
    unittest.main()