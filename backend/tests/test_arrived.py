import requests


BASE="http://localhost:3000"


trip_id="4d04fedb-96db-45b3-b929-8596af79ddcd"


login=requests.post(
    f"{BASE}/auth/login",
    json={
        "email":"conductor2@test.com",
        "password":"123456"
    }
)


token=login.json()["accessToken"]


response=requests.post(

    f"{BASE}/trips/{trip_id}/arrived",

    headers={
        "Authorization":f"Bearer {token}"
    }

)


print(response.status_code)
print(response.text)