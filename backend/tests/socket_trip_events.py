import socketio
import time


TRIP_ID = "fa700e58-255e-4ad6-9417-e9b9756d6c41"

PASSENGER_ID = "a464f1c8-ab8d-4610-a77e-750a3e8592f2"


sio = socketio.Client()


@sio.event
def connect():
    print("🟢 Socket conectado")


    sio.emit(
        "passenger:join",
        {
            "passengerId": PASSENGER_ID
        }
    )


@sio.event
def disconnect():
    print("🔴 desconectado")


# ==========================
# EVENTOS DEL VIAJE
# ==========================


@sio.on("trip:assigned")
def assigned(data):

    print("\n====================")
    print("🚗 TRIP ASSIGNED")
    print("====================")
    print(data)



@sio.on("trip:accepted")
def accepted(data):

    print("\n====================")
    print("✅ TRIP ACCEPTED")
    print("====================")
    print(data)



@sio.on("trip:arrived")
def arrived(data):

    print("\n====================")
    print("📍 DRIVER ARRIVED")
    print("====================")
    print(data)



@sio.on("trip:started")
def started(data):

    print("\n====================")
    print("▶️ TRIP STARTED")
    print("====================")
    print(data)



@sio.on("trip:completed")
def completed(data):

    print("\n====================")
    print("🏁 TRIP COMPLETED")
    print("====================")
    print(data)



print("Conectando...")


sio.connect(
    "http://localhost:3000"
)


print("Escuchando eventos...")


while True:

    time.sleep(1)