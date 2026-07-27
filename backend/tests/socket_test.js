const { io } = require("socket.io-client");


const tripId =
"26aea04e-d527-4ecf-827b-dc6c20f3861b";


const socket = io(
  "http://localhost:3000"
);



socket.on(
  "connect",
  ()=>{

    console.log(
      "🟢 SOCKET CONECTADO:",
      socket.id
    );


    socket.emit(
      "trip:join",
      {
        tripId
      }
    );


    console.log(
      "🗺️ UNIDO A VIAJE:",
      tripId
    );


  }
);



socket.on(
  "driver:location",
  (data)=>{


    console.log(
      "\n📍 UBICACION RECIBIDA"
    );


    console.log(
      data
    );


  }
);



socket.on(
  "disconnect",
  ()=>{

    console.log(
      "🔴 SOCKET DESCONECTADO"
    );

  }
);