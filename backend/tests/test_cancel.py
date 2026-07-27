import requests
import json


BASE_URL = "http://localhost:3000"


print("\n========== LOGIN CLIENTE ==========")


login = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email":"cliente@test.com",
        "password":"123456"
    }
)


data = login.json()

token = data["accessToken"]


headers = {
    "Authorization":f"Bearer {token}"
}


print("TOKEN OK")



print("\n========== CREAR VIAJE ==========")


trip = requests.post(

    f"{BASE_URL}/trips",

    headers=headers,

    json={

        "origin":"Plaza Zacualtipan",

        "destination":"Centro Zacualtipan",

        "originLatitude":20.6475,

        "originLongitude":-98.6578,

        "destinationLatitude":20.65,

        "destinationLongitude":-98.66

    }

)


trip_data = trip.json()


print(
    json.dumps(
        trip_data,
        indent=4
    )
)


trip_id = trip_data["id"]


print("\nTRIP ID:")
print(trip_id)



print("\n========== CANCELAR VIAJE ==========")


cancel = requests.post(

    f"{BASE_URL}/trips/{trip_id}/cancel",

    headers=headers

)


print(
    "STATUS CANCEL:",
    cancel.status_code
)


print(
    json.dumps(
        cancel.json(),
        indent=4
    )
)