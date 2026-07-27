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


print(
    "TRIP ID:",
    trip_id
)



# =====================================
# ESPERAR DRIVER
# =====================================

print("\n========== ESPERANDO DRIVER ==========")


driver_email = None


for i in range(15):


    check = requests.get(

        f"{BASE_URL}/trips/{trip_id}",

        headers={
            "Authorization":
            f"Bearer {client_token}"
        }

    )


    trip = check.json()


    if trip.get("driver"):

        driver_email = trip["driver"]["email"]

        break


    print(
        "Esperando matcher..."
    )

    time.sleep(1)



if not driver_email:

    print(
        "ERROR: sin conductor"
    )

    print(
        json.dumps(
            trip,
            indent=4
        )
    )

    exit()



print(
    "DRIVER:",
    driver_email
)



# =====================================
# LOGIN DRIVER
# =====================================

print("\n========== LOGIN DRIVER ==========")


login_driver = requests.post(

    f"{BASE_URL}/auth/login",

    json={

        "email":driver_email,

        "password":"123456"

    }

)


driver_token = login_driver.json()["accessToken"]


headers_driver = {

    "Authorization":
    f"Bearer {driver_token}"

}



# =====================================
# ACCEPT
# =====================================

print("\n========== ACCEPT ==========")


accept = requests.post(

    f"{BASE_URL}/trips/{trip_id}/accept",

    headers=headers_driver

)


print(
    accept.status_code
)

print(
    json.dumps(
        accept.json(),
        indent=4
    )
)



# =====================================
# ARRIVED
# =====================================

print("\n========== ARRIVED ==========")


arrived = requests.post(

    f"{BASE_URL}/trips/{trip_id}/arrived",

    headers=headers_driver

)


print(
    arrived.status_code
)

print(
    json.dumps(
        arrived.json(),
        indent=4
    )
)



# =====================================
# START
# =====================================

print("\n========== START ==========")


start = requests.post(

    f"{BASE_URL}/trips/{trip_id}/start",

    headers=headers_driver

)


print(
    start.status_code
)

print(
    json.dumps(
        start.json(),
        indent=4
    )
)



# =====================================
# COMPLETE
# =====================================

print("\n========== COMPLETE ==========")


complete = requests.post(

    f"{BASE_URL}/trips/{trip_id}/complete",

    headers=headers_driver

)


print(
    complete.status_code
)

final_trip = complete.json()


print(
    json.dumps(
        final_trip,
        indent=4
    )
)



# =====================================
# RESULTADO
# =====================================

print("\n========== RESULTADO FINAL ==========")

print(
    "STATUS:",
    final_trip["status"]
)