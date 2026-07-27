import requests
import threading
import json
import time


BASE_URL = "http://localhost:3000"

# =====================================
# LOGIN CLIENTE
# =====================================

login = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "cliente@test.com",
        "password": "123456"
    }
)

assert login.status_code == 200

client_token = login.json()["accessToken"]

# =====================================
# CREAR VIAJE
# =====================================

trip = requests.post(
    f"{BASE_URL}/trips",
    headers={
        "Authorization": f"Bearer {client_token}"
    },
    json={
        "origin": "Plaza",
        "destination": "Centro",
        "originLatitude": 20.6475,
        "originLongitude": -98.6578,
        "destinationLatitude": 20.6500,
        "destinationLongitude": -98.6600
    }
)

assert trip.status_code == 200




trip = trip.json()

trip_id = trip["id"]


# =====================================
# ESPERAR ASIGNACIÓN DE DRIVER
# =====================================

# =====================================
# ESPERAR ASIGNACIÓN DE DRIVER
# =====================================

print("\nEsperando matcher...\n")


driver_email = None


for i in range(10):

    check = requests.get(
        f"{BASE_URL}/trips/{trip_id}",
        headers={
            "Authorization": f"Bearer {client_token}"
        }
    )


    print(
        f"Intento {i+1}/10"
    )


    print(
        "STATUS CONSULTA:",
        check.status_code
    )


    if check.status_code != 200:

        print(
            "Respuesta:",
            check.text
        )

        time.sleep(1)

        continue


    trip = check.json()


    if trip.get("driver"):

        driver_email = trip["driver"]["email"]

        break


    print(
        "Aún sin conductor..."
    )


    time.sleep(1)



if not driver_email:

    print(
        "\nERROR: No se asignó conductor"
    )

    print(
        json.dumps(
            trip,
            indent=4
        )
    )

    exit()


print("Trip:", trip_id)

print("Driver:", driver_email)

# =====================================
# LOGIN DRIVER
# =====================================

driver = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": driver_email,
        "password": "123456"
    }
)

assert driver.status_code == 200

driver_token = driver.json()["accessToken"]

headers = {
    "Authorization": f"Bearer {driver_token}"
}

responses = []

# =====================================
# DOS PETICIONES ACCEPT SIMULTÁNEAS
# =====================================

def accept_trip(nombre):

    response = requests.post(
        f"{BASE_URL}/trips/{trip_id}/accept",
        headers=headers
    )

    try:

        body = response.json()

    except Exception:

        body = response.text

    responses.append({
        "thread": nombre,
        "status": response.status_code,
        "body": body
    })


t1 = threading.Thread(
    target=accept_trip,
    args=("THREAD-1",)
)

t2 = threading.Thread(
    target=accept_trip,
    args=("THREAD-2",)
)

print("\n========== ENVIANDO DOS ACCEPT ==========\n")

t1.start()
t2.start()

t1.join()
t2.join()

print("\n========== RESPUESTAS ==========\n")

for r in responses:

    print("--------------------------------")

    print("Hilo:", r["thread"])

    print("HTTP:", r["status"])

    print(json.dumps(
        r["body"],
        indent=4
    ))