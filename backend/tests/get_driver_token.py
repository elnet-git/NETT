import requests


r = requests.post(
    "http://localhost:3000/auth/login",
    json={
        "email":"driver@test.com",
        "password":"123456"
    }
)


print(r.status_code)

data = r.json()

print()
print("TOKEN DRIVER:")
print(data["accessToken"])
