import requests
import time


BASE_URL = "http://localhost:3000"


TRIP_ID = "b2aa9c73-6069-40ef-8546-414f45fff346"


DRIVER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMzgzYmE5MC1jMTI1LTQyYzUtYjQ2MC0yMzNhZDQ0ZDdkYWQiLCJyb2xlIjoiRFJJVkVSIiwiaWF0IjoxNzg1MTMxNDQzLCJleHAiOjE3ODUxMzIzNDN9.xVRGVee1oNyUg6pgeKBMGkmPtn2ig7t__fzltMABQ14"


headers = {
    "Authorization": f"Bearer {DRIVER_TOKEN}"
}


locations = [

    {
        "latitude":20.6475,
        "longitude":-98.6578
    },

    {
        "latitude":20.6480,
        "longitude":-98.6570
    },

    {
        "latitude":20.6490,
        "longitude":-98.6560
    },

    {
        "latitude":20.6500,
        "longitude":-98.6600
    }

]


print("\n========== TRACKING MOVEMENT ==========")


for i, location in enumerate(locations):

    print("\nEnviando ubicación:", i+1)

    response = requests.post(
        f"{BASE_URL}/trips/{TRIP_ID}/location",
        headers=headers,
        json=location
    )

    print(
        "STATUS:",
        response.status_code
    )

    print(
        response.text
    )


    time.sleep(3)


print("\n========== FIN ==========")