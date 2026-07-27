import requests
import json
import time

BASE_URL = "http://localhost:3000"

# =====================================
# LOGIN CLIENTE
# =====================================

print("\n========== LOGIN CLIENTE ==========")

login_client = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "cliente@test.com",
        "password": "123456"
    }
)

print(
    "STATUS LOGIN CLIENTE:",
    login_client.status_code
)

if login_client.status_code != 200:
    print(login_client.text)
    exit()

client_data = login_client.json()

client_token = client_data["accessToken"]

print("\nTOKEN CLIENTE:")
print(client_token)

# =====================================
# CREAR VIAJE
# =====================================

print("\n========== CREATE TRIP ==========")

trip_response = requests.post(
    f"{BASE_URL}/trips",
    headers={
        "Authorization": f"Bearer {client_token}"
    },
    json={
        "origin": "Plaza Zacualtipan",
        "destination": "Centro Zacualtipan",
        "originLatitude": 20.6475,
        "originLongitude": -98.6578,
        "destinationLatitude": 20.6500,
        "destinationLongitude": -98.6600
    }
)

print(
    "STATUS CREATE:",
    trip_response.status_code
)

if trip_response.status_code != 200:
    print(trip_response.text)
    exit()

trip = trip_response.json()

print(
    json.dumps(
        trip,
        indent=4
    )
)

trip_id = trip["id"]

driver_id = trip.get("driverId")

print("\nTRIP ID:")
print(trip_id)

print("\nDRIVER ID:")
print(driver_id)

if not driver_id:
    print("❌ No hay conductor asignado")
    exit()

# =====================================
# OBTENER EMAIL DEL CONDUCTOR ASIGNADO
# =====================================

driver_email = trip["driver"]["email"]

print("\nCONDUCTOR ASIGNADO:")
print(driver_email)

# =====================================
# LOGIN CONDUCTOR ASIGNADO
# =====================================

print("\n========== LOGIN DRIVER ==========")

login_driver = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": driver_email,
        "password": "123456"
    }
)

print(
    "STATUS LOGIN DRIVER:",
    login_driver.status_code
)

if login_driver.status_code != 200:
    print(login_driver.text)
    exit()

driver_data = login_driver.json()

driver_token = driver_data["accessToken"]

print("\nTOKEN DRIVER:")
print(driver_token)

# =====================================
# RECHAZAR VIAJE
# =====================================

print("\n========== REJECT TRIP ==========")

reject = requests.post(
    f"{BASE_URL}/trips/{trip_id}/reject",
    headers={
        "Authorization": f"Bearer {driver_token}"
    }
)

print(
    "STATUS REJECT:",
    reject.status_code
)

try:
    print(
        json.dumps(
            reject.json(),
            indent=4
        )
    )
except Exception:
    print(reject.text)

# =====================================
# ESPERAR NUEVO MATCHING
# =====================================

print("\nEsperando matcher retry...")

time.sleep(10)

# =====================================
# CONSULTAR VIAJE HASTA NUEVO DRIVER
# =====================================

print("\n========== CONSULTANDO NUEVO DRIVER ==========")

nuevo_driver = None

for intento in range(20):

    print(
        f"\nIntento matcher {intento + 1}/10"
    )

    consulta = requests.get(
        f"{BASE_URL}/trips",
        headers={
            "Authorization": f"Bearer {client_token}"
        }
    )

    print(
        "STATUS CONSULTA:",
        consulta.status_code
    )

    if consulta.status_code != 200:
        print(consulta.text)
        time.sleep(3)
        continue

    try:
        viajes = consulta.json()

    except Exception as error:
        print(
            "ERROR JSON:",
            error
        )

        print(consulta.text)

        time.sleep(2)
        continue

    viaje_actual = None

    if isinstance(viajes, list):

        for viaje in viajes:

            if viaje.get("id") == trip_id:
                viaje_actual = viaje
                break

    else:

        if viajes.get("id") == trip_id:
            viaje_actual = viajes

    if viaje_actual:

        print(
            json.dumps(
                viaje_actual,
                indent=4
            )
        )

        nuevo_driver = viaje_actual.get("driver")

        if nuevo_driver:
            break

    print("Esperando nuevo conductor...")

    time.sleep(3)

if not nuevo_driver:

    print("\n❌ No se asignó nuevo conductor")

    exit()

nuevo_driver_email = nuevo_driver["email"]

nuevo_driver_id = nuevo_driver["id"]

print("\nNUEVO CONDUCTOR:")
print(nuevo_driver_email)

print("\nNUEVO DRIVER ID:")
print(nuevo_driver_id)

# =====================================
# LOGIN NUEVO CONDUCTOR
# =====================================

print("\n========== LOGIN NUEVO DRIVER ==========")

login_driver = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": nuevo_driver_email,
        "password": "123456"
    }
)

print(
    "STATUS LOGIN NUEVO DRIVER:",
    login_driver.status_code
)

if login_driver.status_code != 200:
    print(login_driver.text)
    exit()

driver_data = login_driver.json()

driver_token = driver_data["accessToken"]

print("\nTOKEN NUEVO DRIVER:")
print(driver_token)

# =====================================
# ACCEPT
# =====================================

print("\n========== ACCEPT TRIP ==========")

accept = requests.post(
    f"{BASE_URL}/trips/{trip_id}/accept",
    headers={
        "Authorization": f"Bearer {driver_token}"
    }
)

print(
    "STATUS ACCEPT:",
    accept.status_code
)

try:

    print(
        json.dumps(
            accept.json(),
            indent=4
        )
    )

except Exception:

    print(
        accept.text
    )

# =====================================
# ARRIVED
# =====================================

print("\n========== DRIVER ARRIVED ==========")

arrived = requests.post(
    f"{BASE_URL}/trips/{trip_id}/arrived",
    headers={
        "Authorization": f"Bearer {driver_token}"
    }
)

print(
    "STATUS ARRIVED:",
    arrived.status_code
)

try:

    print(
        json.dumps(
            arrived.json(),
            indent=4
        )
    )

except Exception:

    print(
        arrived.text
    )

# =====================================
# START
# =====================================

print("\n========== START TRIP ==========")

start = requests.post(
    f"{BASE_URL}/trips/{trip_id}/start",
    headers={
        "Authorization": f"Bearer {driver_token}"
    }
)

print(
    "STATUS START:",
    start.status_code
)

try:

    print(
        json.dumps(
            start.json(),
            indent=4
        )
    )

except Exception:

    print(
        start.text
    )


# =====================================
# CONSULTAR ESTADO FINAL DEL VIAJE
# =====================================

final = requests.get(
    f"{BASE_URL}/trips",
    headers={
        "Authorization": f"Bearer {client_token}"
    }
)

print(
    "STATUS FINAL:",
    final.status_code
)

if final.status_code == 200:

    try:

        viajes_finales = final.json()

        viaje_final = None

        if isinstance(viajes_finales, list):

            for viaje in viajes_finales:

                if viaje.get("id") == trip_id:

                    viaje_final = viaje
                    break

        else:

            viaje_final = viajes_finales

        print(
            json.dumps(
                viaje_final,
                indent=4
            )
        )

        if viaje_final:

            print("\n========== RESUMEN ==========")

            print(
                "ID:",
                viaje_final.get("id")
            )

            print(
                "STATUS:",
                viaje_final.get("status")
            )

            print(
                "DRIVER:",
                viaje_final.get("driver", {}).get("email")
                if viaje_final.get("driver")
                else None
            )

            print(
                "PASSENGER:",
                viaje_final.get("passenger", {}).get("email")
                if viaje_final.get("passenger")
                else None
            )

            print(
                "ORIGIN:",
                viaje_final.get("origin")
            )

            print(
                "DESTINATION:",
                viaje_final.get("destination")
            )

            if viaje_final.get("status") == "IN_PROGRESS":

                print(
                    "\n✅ Viaje listo para probar tracking."
                )

            else:

                print(
                    f"\n⚠ Estado actual: {viaje_final.get('status')}"
                )
    except Exception as error:

        print(
            "ERROR FINAL JSON:",
            error
        )

        print(final.text)

else:

    print(final.text)

print("\n========== DATOS PARA TRACKING ==========")

print("Trip ID:")
print(trip_id)

print("\nDriver Token:")
print(driver_token)

print("\nEndpoint:")
print(f"{BASE_URL}/trips/{trip_id}/location")

print("\nBody:")
print(json.dumps({
    "latitude": 20.6475,
    "longitude": -98.6578
}, indent=4))

print("\n========== FIN DEL FLUJO ==========")