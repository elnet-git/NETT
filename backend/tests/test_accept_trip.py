import requests
import time


BASE = "http://localhost:3000"



# =====================================
# LOGIN CLIENTE
# =====================================

print("\n========== LOGIN CLIENTE ==========")


client_login = requests.post(
    f"{BASE}/auth/login",
    json={
        "email":"cliente@test.com",
        "password":"123456"
    }
)


client_data = client_login.json()

client_token = client_data["accessToken"]


print("CLIENT TOKEN OK")



# =====================================
# CREAR VIAJE
# =====================================

print("\n========== CREAR VIAJE ==========")


trip_response = requests.post(

    f"{BASE}/trips",

    headers={
        "Authorization":
        f"Bearer {client_token}"
    },

    json={

        "origin":"Plaza Zacualtipan",

        "destination":
        "Centro Zacualtipan",

        "originLatitude":
        20.6475,

        "originLongitude":
        -98.6578,

        "destinationLatitude":
        20.6500,

        "destinationLongitude":
        -98.6600

    }

)


trip = trip_response.json()


print(trip)



trip_id = trip["id"]


driver_id = trip["driverId"]


print("\nTRIP ID:")
print(trip_id)


print("\nDRIVER ASIGNADO:")
print(driver_id)



# =====================================
# LOGIN CONDUCTOR ASIGNADO
# =====================================

print("\n========== LOGIN CONDUCTOR ==========")


if driver_id == "5ad85c08-7ade-470d-b3e0-4655ffabf9f5":

    email="conductor@test.com"


else:

    email="conductor2@test.com"



driver_login = requests.post(

    f"{BASE}/auth/login",

    json={

        "email":email,

        "password":"123456"

    }

)



driver_data = driver_login.json()


driver_token = driver_data["accessToken"]


print("DRIVER TOKEN OK")



# =====================================
# ACEPTAR VIAJE
# =====================================

print("\n========== ACEPTANDO VIAJE ==========")


response = requests.post(

    f"{BASE}/trips/{trip_id}/accept",

    headers={

        "Authorization":
        f"Bearer {driver_token}"

    }

)



print("STATUS:")
print(response.status_code)


print(response.text)