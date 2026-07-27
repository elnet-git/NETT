import requests
import time
import json

BASE_URL = "http://localhost:3000"


# =====================================
# LOGIN CLIENTE
# =====================================

print("\n========== LOGIN CLIENTE ==========")

login_client = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email":"cliente@test.com",
        "password":"123456"
    }
)

print(login_client.status_code)

client_token = login_client.json()["accessToken"]


# =====================================
# CREAR VIAJE
# =====================================

print("\n========== CREAR VIAJE ==========")

trip_response = requests.post(
    f"{BASE_URL}/trips",
    headers={
        "Authorization":f"Bearer {client_token}"
    },
    json={
        "origin":"Plaza",
        "destination":"Centro",
        "originLatitude":20.6475,
        "originLongitude":-98.6578,
        "destinationLatitude":20.6500,
        "destinationLongitude":-98.6600
    }
)

trip = trip_response.json()

trip_id = trip["id"]

print("TRIP ID:", trip_id)


# =====================================
# ESPERAR PRIMER DRIVER
# =====================================

print("\n========== PRIMER DRIVER ==========")

first_driver = None

for i in range(20):

    check = requests.get(
        f"{BASE_URL}/trips/{trip_id}",
        headers={
            "Authorization":f"Bearer {client_token}"
        }
    )

    trip = check.json()

    if trip.get("driver"):

        first_driver = trip["driver"]["email"]

        print(
            "Driver asignado:",
            first_driver
        )

        break

    print("Esperando matcher...")

    time.sleep(1)


if not first_driver:

    print("No hubo conductor")

    exit()


# =====================================
# NO HACER NADA
# =====================================

print("\n========== ESPERANDO TIMEOUT ==========")
print("NO se aceptará el viaje...")

time.sleep(35)


# =====================================
# ESPERAR NUEVO DRIVER
# =====================================

print("\n========== ESPERANDO REASIGNACION ==========")

second_driver = None

for i in range(25):

    check = requests.get(
        f"{BASE_URL}/trips/{trip_id}",
        headers={
            "Authorization":f"Bearer {client_token}"
        }
    )

    trip = check.json()

    driver = trip.get("driver")

    if driver:

        if driver["email"] != first_driver:

            second_driver = driver["email"]

            print(
                "Nuevo conductor:",
                second_driver
            )

            break

    print("Esperando nuevo conductor...")

    time.sleep(2)


if not second_driver:

    print("ERROR")
    print("Nunca reasignó conductor")

    print(json.dumps(
        trip,
        indent=4
    ))

    exit()


# =====================================
# LOGIN NUEVO DRIVER
# =====================================

print("\n========== LOGIN NUEVO DRIVER ==========")

login_driver = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email":second_driver,
        "password":"123456"
    }
)

driver_token = login_driver.json()["accessToken"]

headers_driver = {
    "Authorization":f"Bearer {driver_token}"
}


# =====================================
# ACCEPT
# =====================================

print("\n========== ACCEPT ==========")

accept = requests.post(
    f"{BASE_URL}/trips/{trip_id}/accept",
    headers=headers_driver
)

print(accept.status_code)

print(
    json.dumps(
        accept.json(),
        indent=4
    )
)


# =====================================
# CONSULTAR VIAJE
# =====================================

print("\n========== VIAJE FINAL ==========")

trip = requests.get(
    f"{BASE_URL}/trips/{trip_id}",
    headers={
        "Authorization":f"Bearer {client_token}"
    }
).json()

print(
    json.dumps(
        trip,
        indent=4
    )
)

print("\n========== RESULTADO ==========")

print(
    "STATUS:",
    trip["status"]
)

print(
    "PRIMER DRIVER :",
    first_driver
)

print(
    "SEGUNDO DRIVER:",
    second_driver
)

if first_driver != second_driver:
    print("\n✅ TIMEOUT Y REASIGNACIÓN FUNCIONAN")
else:
    print("\n❌ ERROR: se volvió a asignar el mismo conductor")