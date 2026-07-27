import requests
import json


BASE_URL = "http://localhost:3000"


TRIP_ID = "26aea04e-d527-4ecf-827b-dc6c20f3861b"


print("\n========== LOGIN DRIVER ==========")


login = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email":"conductor@test.com",
        "password":"123456"
    }
)


print("STATUS LOGIN:", login.status_code)


data = login.json()


print(json.dumps(data, indent=4))


token = data["accessToken"]


print("\nTOKEN OK")



headers = {

    "Authorization": f"Bearer {token}"

}



print("\n========== COMPLETE TRIP ==========")


response = requests.post(

    f"{BASE_URL}/trips/{TRIP_ID}/complete",

    headers=headers

)


print(
    "STATUS COMPLETE:",
    response.status_code
)


print(
    json.dumps(
        response.json(),
        indent=4
    )
)