import requests
import json


BASE = "http://localhost:3000"


def login():

    r = requests.post(
        BASE + "/auth/login",
        json={
            "email":"conductor2@test.com",
            "password":"123456"
        }
    )

    print("\n========== LOGIN DRIVER ==========")
    print(r.status_code)

    data = r.json()

    print(json.dumps(data,indent=2))

    return data["accessToken"], data["user"]["id"]



def get_trips(token,driverId):

    headers={
        "Authorization":f"Bearer {token}"
    }


    r = requests.get(
        BASE + "/trips/my-driver",
        headers=headers
    )


    print("\n========== DRIVER TRIPS ==========")
    print(r.status_code)

    trips=r.json()

    print(json.dumps(trips,indent=2))


    return trips[0]




def accept_trip(token,tripId):

    headers={
        "Authorization":f"Bearer {token}"
    }


    r=requests.post(

        BASE+f"/trips/{tripId}/accept",

        headers=headers

    )


    print("\n========== ACCEPT ==========")
    print(r.status_code)

    print(json.dumps(
        r.json(),
        indent=2
    ))





token,driverId = login()


trip=get_trips(
    token,
    driverId
)


accept_trip(
    token,
    trip["id"]
)