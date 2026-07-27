const { io } = require("socket.io-client");


const tripId =
"027c4fe9-bca7-4985-ae74-8f2723f7f61f";


const socket = io(
    "http://localhost:3000"
);



socket.on(
"connect",
()=>{

    console.log(
        "🟢 Socket conectado:",
        socket.id
    );


    socket.emit(
        "trip:join",
        {
            tripId
        }
    );


    console.log(
        "🗺️ Unido al viaje:",
        tripId
    );

});



socket.on(
"driver:location",
(data)=>{

    console.log(
        "🚗 UBICACIÓN RECIBIDA"
    );

    console.log(data);

});



socket.on(
"disconnect",
()=>{

    console.log(
        "🔴 Socket desconectado"
    );

});