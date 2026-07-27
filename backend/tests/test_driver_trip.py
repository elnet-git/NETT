import requests


BASE_URL = "http://localhost:3000"


TRIP_ID = "e23b3a5a-e1d5-4203-81b0-415cf19fc75e"


driver_token = None



def login_driver():

    global driver_token


    print("\n========== DRIVER LOGIN ==========")


    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email":"driver@test.com",
            "password":"123456"
        }
    )


    print(response.status_code)

    data = response.json()

    driver_token = data["accessToken"]


    print("TOKEN:")
    print(driver_token)






def call_state(action):


    print(
        f"\n========== {action.upper()} =========="
    )


    response = requests.post(

        f"{BASE_URL}/trips/{TRIP_ID}/{action}",

        headers={
            "Authorization":
            f"Bearer {driver_token}"
        }

    )


    print(
        "STATUS:",
        response.status_code
    )


    print(
        response.text
    )






if __name__=="__main__":


    login_driver()


    call_state(
        "accept"
    )


    call_state(
        "arrived"
    )


    call_state(
        "start"
    )


    call_state(
        "complete"
    )