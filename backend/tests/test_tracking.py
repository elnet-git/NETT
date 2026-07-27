import requests
import json


BASE_URL = "http://localhost:3000"


TRIP_ID = "2f98f644-cba8-4dd3-b292-0a8def65e28a"


# =====================================
# LOGIN DRIVER
# =====================================

print("\n========== LOGIN DRIVER ==========")


login = requests.post(

    f"{BASE_URL}/auth/login",

    json={

        "email":"conductor2@test.com",

        "password":"123456"

    }

)


print("STATUS LOGIN:", login.status_code)


data = login.json()

print("\nRESPUESTA LOGIN:")
print(json.dumps(data, indent=4))


token = data["accessToken"]

print("TOKEN OK")



headers = {

    "Authorization": f"Bearer {token}"

}



# =====================================
# ENVIAR UBICACION
# =====================================

print("\n========== SEND LOCATION ==========")


response = requests.post(

    f"{BASE_URL}/trips/{TRIP_ID}/location",

    headers=headers,

    json={

        "latitude":20.6475,

        "longitude":-98.6578

    }

)



print(
    "STATUS LOCATION:",
    response.status_code
)


print(
    json.dumps(
        response.json(),
        indent=4
    )
)