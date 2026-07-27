import requests


BASE = "http://localhost:3000"


trip_id = "509f3dde-4374-432a-b823-a52eb16128d2"


print("\n========== LOGIN CONDUCTOR ==========")


login = requests.post(
    f"{BASE}/auth/login",
    json={
        "email":"conductor@test.com",
        "password":"123456"
    }
)


data = login.json()

token = data["accessToken"]



print("\n========== DRIVER ARRIVED ==========")


response = requests.post(

    f"{BASE}/trips/{trip_id}/arrived",

    headers={
        "Authorization":
        f"Bearer {token}"
    }

)


print("STATUS:",response.status_code)

print(response.text)