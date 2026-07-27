import socketio
import time


TRIP_ID = "b2aa9c73-6069-40ef-8546-414f45fff346"


sio = socketio.Client()


@sio.event
def connect():
    print("🟢 SOCKET CONECTADO")

    sio.emit(
        "trip:join",
        {
            "tripId": TRIP_ID
        }
    )

    print("🗺️ Unido al viaje")


@sio.on("driver:location")
def driver_location(data):

    print("\n========== LOCATION RECIBIDA ==========")

    print(data)

    print("=======================================")


@sio.event
def disconnect():

    print("🔴 SOCKET DESCONECTADO")



print("Conectando...")


sio.connect(
    "http://localhost:3000"
)


print("Esperando ubicación...")

time.sleep(60)