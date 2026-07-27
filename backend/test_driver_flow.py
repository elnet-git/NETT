import requests
import json
import time


BASE_URL = "http://localhost:3000"

DRIVER_EMAIL = "conductor@test.com"
DRIVER_PASSWORD = "123456"


def print_response(title, response):
    print("\n==========", title, "==========")
    print("STATUS:", response.status_code)

    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)


# =========================
# LOGIN CONDUCTOR
# =========================

login = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": DRIVER_EMAIL,
        "password": DRIVER_PASSWORD
    }
)

print_response("LOGIN DRIVER", login)


if login.status_code != 200:
    exit()


token = login.json()["accessToken"]


headers = {
    "Authorization": f"Bearer {token}"
}


# =========================
# BUSCAR VIAJES ASIGNADOS
# =========================

trips = requests.get(
    f"{BASE_URL}/trips/my-driver",
    headers=headers
)

print_response("MY DRIVER TRIPS", trips)


if trips.status_code != 200:
    exit()


data = trips.json()


if len(data) == 0:
    print("NO HAY VIAJES ASIGNADOS")
    exit()


trip = data[0]

trip_id = trip["id"]


print("\nTRIP SELECTED:")
print(trip_id)



# =========================
# ACEPTAR VIAJE
# =========================

accept = requests.post(
    f"{BASE_URL}/trips/{trip_id}/accept",
    headers=headers
)

print_response("ACCEPT TRIP", accept)



time.sleep(1)



# =========================
# LLEGAR
# =========================

arrived = requests.post(
    f"{BASE_URL}/trips/{trip_id}/arrived",
    headers=headers
)

print_response("ARRIVED TRIP", arrived)



time.sleep(1)



# =========================
# INICIAR
# =========================

start = requests.post(
    f"{BASE_URL}/trips/{trip_id}/start",
    headers=headers
)

print_response("START TRIP", start)



time.sleep(1)



# =========================
# COMPLETAR
# =========================

complete = requests.post(
    f"{BASE_URL}/trips/{trip_id}/complete",
    headers=headers
)

print_response("COMPLETE TRIP", complete)