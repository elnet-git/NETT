import socketio

SERVER = "http://localhost:3000"

sio = socketio.Client()


@sio.event
def connect():
    print("\n🟢 Conectado al servidor Socket.IO\n")


@sio.event
def disconnect():
    print("\n🔴 Desconectado\n")


@sio.on("trip:location")
def trip_location(data):
    print("\n==============================")
    print("📍 EVENTO trip:location")
    print("==============================")
    print(data)


trip_id = input(
    "Trip ID: "
).strip()


sio.connect(SERVER)

sio.emit(
    "trip:join",
    {
        "tripId": trip_id
    }
)

print("\nEsperando ubicaciones...\n")

sio.wait()