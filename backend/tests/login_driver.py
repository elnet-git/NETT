import requests

BASE_URL="http://localhost:3000"


response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email":"conductor2@test.com",
        "password":"123456"
    }
)


print(response.status_code)
print(response.json()["accessToken"])