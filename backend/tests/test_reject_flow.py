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
# REJECT
# =====================================

print("\n========== REJECT ==========")

reject = requests.post(

    f"{BASE_URL}/trips/{trip_id}/reject",

    headers=headers_driver

)

print(reject.status_code)

print(

    json.dumps(

        reject.json(),

        indent=4

    )

)

# =====================================
# ESPERANDO REASIGNACION
# =====================================

print("\n========== ESPERANDO REASIGNACION ==========")

nuevo_driver = None

for i in range(30):

    check = requests.get(

        f"{BASE_URL}/trips/{trip_id}",

        headers={

            "Authorization":f"Bearer {client_token}"

        }

    )

    trip = check.json()

    if trip.get("driver"):

        email = trip["driver"]["email"]

        if email != driver_email:

            nuevo_driver = email
            break

    print("Esperando nuevo conductor...")

    time.sleep(1)


if not nuevo_driver:

    print("ERROR: no hubo reasignación")

    print(json.dumps(trip, indent=4))

    exit()


print("\n========== NUEVO DRIVER ==========")

print(nuevo_driver)


# =====================================
# LOGIN NUEVO DRIVER
# =====================================

login_driver = requests.post(

    f"{BASE_URL}/auth/login",

    json={

        "email":nuevo_driver,

        "password":"123456"

    }

)

driver_token = login_driver.json()["accessToken"]

headers_driver = {

    "Authorization":f"Bearer {driver_token}"

}


# =====================================
# ACCEPT NUEVO DRIVER
# =====================================

accept = requests.post(

    f"{BASE_URL}/trips/{trip_id}/accept",

    headers=headers_driver

)

print("\n========== ACCEPT NUEVO DRIVER ==========")

print(accept.status_code)

print(json.dumps(accept.json(), indent=4))


# =====================================
# RESULTADO FINAL
# =====================================

final_trip = requests.get(

    f"{BASE_URL}/trips/{trip_id}",

    headers={

        "Authorization":f"Bearer {client_token}"

    }

)

print("\n========== VIAJE ==========")

print(json.dumps(final_trip.json(), indent=4))