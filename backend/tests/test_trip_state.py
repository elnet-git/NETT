import requests
import json

BASE_URL = "http://localhost:3000"

# ==========================================
# LOGIN CONDUCTOR
# ==========================================

print("\n========== LOGIN DRIVER ==========")

login_data = {
    "email": "driver@test.com",
    "password": "123456"
}

login = requests.post(
    f"{BASE_URL}/auth/login",
    json=login_data
)

print("STATUS LOGIN:", login.status_code)
print(login.text)

if login.status_code != 200:
    exit()

token = login.json()["accessToken"]

headers = {
    "Authorization": f"Bearer {token}"
}

# ==========================================
# OBTENER VIAJES DEL CONDUCTOR
# ==========================================

print("\n========== MY DRIVER TRIPS ==========")

response = requests.get(
    f"{BASE_URL}/trips/my-driver",
    headers=headers
)

print("STATUS:", response.status_code)

if response.status_code != 200:
    print(response.text)
    exit()

trips = response.json()

print(json.dumps(trips, indent=4, ensure_ascii=False))

if len(trips) == 0:
    print("\nNo hay viajes asignados.")
    exit()

trip = None

for t in trips:

    if t["status"] == "DRIVER_ASSIGNED":
        trip = t
        break

if trip is None:
    print("\nNo existe ningún viaje en DRIVER_ASSIGNED")
    exit()

trip_id = trip["id"]

print("\nViaje encontrado:")
print(trip_id)

# ==========================================
# ACCEPT
# ==========================================

print("\n========== ACCEPT ==========")

response = requests.post(
    f"{BASE_URL}/trips/{trip_id}/accept",
    headers=headers
)

print("STATUS:", response.status_code)

try:
    print(json.dumps(response.json(), indent=4, ensure_ascii=False))
except:
    print(response.text)

# ==========================================
# ARRIVED
# ==========================================

print("\n========== ARRIVED ==========")

response = requests.post(
    f"{BASE_URL}/trips/{trip_id}/arrived",
    headers=headers
)

print("STATUS:", response.status_code)

try:
    print(json.dumps(response.json(), indent=4, ensure_ascii=False))
except:
    print(response.text)

# ==========================================
# START
# ==========================================

print("\n========== START ==========")

response = requests.post(
    f"{BASE_URL}/trips/{trip_id}/start",
    headers=headers
)

print("STATUS:", response.status_code)

try:
    print(json.dumps(response.json(), indent=4, ensure_ascii=False))
except:
    print(response.text)

# ==========================================
# COMPLETE
# ==========================================

print("\n========== COMPLETE ==========")

response = requests.post(
    f"{BASE_URL}/trips/{trip_id}/complete",
    headers=headers
)

print("STATUS:", response.status_code)

try:
    print(json.dumps(response.json(), indent=4, ensure_ascii=False))
except:
    print(response.text)

print("\n========== FIN ==========")