import requests
import json


BASE_URL = "http://localhost:3000"


# =====================================
# DATOS DEL VIAJE ACTIVO
# =====================================

TRIP_ID = "b2aa9c73-6069-40ef-8546-414f45fff346"


# =====================================
# LOGIN CLIENTE
# =====================================

print("\n========== LOGIN CLIENTE ==========")


login = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "cliente@test.com",
        "password": "123456"
    }
)


print(
    "STATUS LOGIN:",
    login.status_code
)


if login.status_code != 200:
    print(login.text)
    exit()


token = login.json()["accessToken"]


print("\nTOKEN OK")



# =====================================
# CONSULTAR ULTIMA UBICACION
# =====================================

print("\n========== LAST LOCATION ==========")


response = requests.get(

    f"{BASE_URL}/trips/{TRIP_ID}/location",

    headers={

        "Authorization":
        f"Bearer {token}"

    }

)


print(
    "STATUS:",
    response.status_code
)


try:

    print(
        json.dumps(
            response.json(),
            indent=4
        )
    )


except Exception:

    print(response.text)