import socketio
import time


DRIVER_ID = "5ad85c08-7ade-470d-b3e0-4655ffabf9f5"


sio = socketio.Client()


@sio.event
def connect():
    print("🟢 Socket conectado")

    sio.emit(
        "driver:online",
        {
            "driverId": DRIVER_ID
        }
    )

    print(
        "🚗 Driver registrado:",
        DRIVER_ID
    )



@sio.on("trip:new")
def trip_new(data):

    print("\n====================")
    print("🚗 TRIP NEW")
    print("====================")

    print(data)



@sio.on("trip:cancelled")
def trip_cancelled(data):

    print("\n====================")
    print("🚫 TRIP CANCELLED")
    print("====================")

    print(data)



@sio.on("trip:expired")
def trip_expired(data):

    print("\n====================")
    print("⏳ TRIP EXPIRED")
    print("====================")

    print(data)



@sio.event
def disconnect():

    print(
        "🔴 Socket desconectado"
    )



print("Conectando...")


sio.connect(
    "http://localhost:3000"
)


print(
    "Escuchando eventos..."
)


while True:

    time.sleep(1)