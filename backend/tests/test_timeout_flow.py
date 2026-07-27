import requests
import time
import json


BASE_URL = "http://localhost:3000"


CLIENT_EMAIL = "cliente@test.com"
CLIENT_PASSWORD = "123456"



def login():

    print("\n========== LOGIN CLIENTE ==========")

    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": CLIENT_EMAIL,
            "password": CLIENT_PASSWORD
        }
    )


    print("STATUS:", response.status_code)

    data = response.json()

    print(json.dumps(data, indent=2))


    return data["accessToken"]





def create_trip(token):

    print("\n========== CREANDO VIAJE ==========")


    body = {

        "origin":"Centro",

        "destination":"Mercado",

        "originLatitude":20.105,

        "originLongitude":-98.720,

        "destinationLatitude":20.110,

        "destinationLongitude":-98.715

    }



    response = requests.post(

        f"{BASE_URL}/trips",

        headers={

            "Authorization":f"Bearer {token}"

        },

        json=body

    )


    print("STATUS:",response.status_code)


    data=response.json()


    print(json.dumps(data,indent=2))


    return data["id"]





def get_trip(token,trip_id):


    response=requests.get(

        f"{BASE_URL}/trips",

        headers={

            "Authorization":f"Bearer {token}"

        }

    )



    if response.status_code != 200:

        print(
            "ERROR CONSULTANDO VIAJES",
            response.text
        )

        return None



    trips=response.json()



    for trip in trips:


        if trip["id"] == trip_id:

            return trip





    print(
        "VIAJE NO ENCONTRADO:",
        trip_id
    )


    return None







def watch_trip(token,trip_id):


    print("\n========== MONITOREANDO TIMEOUT ==========")


    old_status=None


    for i in range(12):


        trip=get_trip(
            token,
            trip_id
        )


        if trip:


            status=trip.get("status")


            driver=trip.get("driverId")



            if status != old_status:


                print("\n----------------------")


                print(
                    "CAMBIO DE ESTADO"
                )


                print(
                    "STATUS:",
                    status
                )


                print(
                    "DRIVER:",
                    driver
                )


                old_status=status





            if status=="EXPIRED":


                print(
                    "\n❌ VIAJE EXPIRADO"
                )


                break





            if status=="DRIVER_ASSIGNED":

    print(
        "\n⏳ Esperando timeout..."
    )

            if status=="MATCHING":

    print(
        "\n🔄 VIAJE VOLVIÓ A MATCHING"
    )

    break

        time.sleep(5)









def main():


    token=login()


    trip_id=create_trip(token)



    print(
        "\nTRIP ID:",
        trip_id
    )



    watch_trip(

        token,

        trip_id

    )






if __name__=="__main__":

    main()