import requests


BASE = "http://localhost:3000"


trip_id = "4d04fedb-96db-45b3-b929-8596af79ddcd"



print("\n========== LOGIN CONDUCTOR ==========")


login = requests.post(
    f"{BASE}/auth/login",
    json={
        "email":"conductor2@test.com",
        "password":"123456"
    }
)


token = login.json()["accessToken"]



print("\n========== COMPLETE TRIP ==========")


response = requests.post(

    f"{BASE}/trips/{trip_id}/complete",

    headers={
        "Authorization":
        f"Bearer {token}"
    }

)



print("STATUS:", response.status_code)

print(response.text)