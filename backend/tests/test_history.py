import requests


BASE_URL = "http://localhost:3000"

TRIP_ID = "b2aa9c73-6069-40ef-8546-414f45fff346"


print("========== LOGIN CLIENTE ==========")


login = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "cliente@test.com",
        "password": "123456"
    }
)


print("STATUS LOGIN:")
print(login.status_code)


token = login.json()["accessToken"]


print("\nTOKEN OK")


print("\n========== HISTORIAL LOCATION ==========")


response = requests.get(
    f"{BASE_URL}/trips/{TRIP_ID}/location/history",
    headers={
        "Authorization": f"Bearer {token}"
    }
)


print("STATUS:")
print(response.status_code)


print(response.text)