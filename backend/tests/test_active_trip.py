import requests


BASE_URL = "http://localhost:3000"


# =====================================
# LOGIN CLIENTE
# =====================================

print("\n========== LOGIN CLIENTE ==========")


login = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email":"cliente@test.com",
        "password":"123456"
    }
)


print("STATUS LOGIN:", login.status_code)


data = login.json()


token = data["accessToken"]


print("TOKEN OK")



# =====================================
# OBTENER VIAJE ACTIVO
# =====================================

print("\n========== ACTIVE TRIP ==========")


response = requests.get(
    f"{BASE_URL}/trips/active",
    headers={
        "Authorization": f"Bearer {token}"
    }
)


print("STATUS:", response.status_code)


print(response.text)