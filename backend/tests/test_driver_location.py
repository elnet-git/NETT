import requests
import json


BASE_URL = "http://localhost:3000"


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


print("STATUS:", login.status_code)


login_data = login.json()


print(
    json.dumps(
        login_data,
        indent=2
    )
)


token = login_data["accessToken"]


headers = {

    "Authorization": f"Bearer {token}",

    "Content-Type":"application/json"

}



# =====================================
# UPDATE LOCATION
# =====================================

print("\n========== UPDATE LOCATION ==========")


location = {

    "latitude":20.6500,

    "longitude":-98.6500,

    "online":True

}



update = requests.post(

    f"{BASE_URL}/location/update",

    headers=headers,

    json=location

)



print("STATUS:", update.status_code)


print(

    json.dumps(

        update.json(),

        indent=2

    )

)



# =====================================
# OBTENER PERFIL DRIVER
# =====================================

driver_id = login_data["user"]["id"]



print("\n========== GET DRIVER LOCATION ==========")



get_location = requests.get(

    f"{BASE_URL}/location/{driver_id}",

    headers=headers

)



print("STATUS:", get_location.status_code)



print(

    json.dumps(

        get_location.json(),

        indent=2

    )

)



print("\n========== TEST COMPLETADO ==========")