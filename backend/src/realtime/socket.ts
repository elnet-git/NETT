import { Server } from "socket.io";

export let io: Server;

export function initSocket(server:any){

  io = new Server(server,{

    cors:{

      origin:"*",

      methods:[
        "GET",
        "POST"
      ]

    }

  });

  io.on(
    "connection",
    (socket)=>{

      console.log(
        "🟢 Socket conectado:",
        socket.id
      );


      // ==========================
      // DRIVER ONLINE
      // ==========================
      socket.on(
        "driver:online",
        (data)=>{


          if(!data?.driverId){

            return;

          }

          socket.join(
            `driver:${data.driverId}`
          );



          console.log(
            "🚗 Driver conectado:",
            data.driverId
          );


        }
      );

      // ==========================
      // PASSENGER ROOM
      // ==========================

      socket.on(
        "passenger:join",
        (data)=>{


          if(!data?.passengerId){

            return;

          }

          socket.join(
            `passenger:${data.passengerId}`
          );

          console.log(
            "👤 Passenger conectado:",
            data.passengerId
          );


        }
      );

      // ==========================
      // TRIP TRACKING ROOM
      // ==========================

      socket.on(
        "trip:join",
        (data)=>{


          if(!data?.tripId){

            return;

          }



          socket.join(
            `trip:${data.tripId}`
          );



          console.log(
            "🗺️ Trip conectado:",
            data.tripId
          );


        }
      );
      // ==========================
      // DISCONNECT
      // ==========================
      socket.on(
        "disconnect",
        ()=>{


          console.log(
            "🔴 Socket desconectado:",
            socket.id
          );


        }
      );



    }
  );


}
// =================================
// Emitir a conductor
// =================================


export function emitToDriver(
  driverId:string,
  event:string,
  data:any
){


  if(!io){

    console.log(
      "Socket no inicializado"
    );

    return;

  }



  console.log(
    `📡 DRIVER ${driverId}`,
    event
  );



  io.to(
    `driver:${driverId}`
  )
  .emit(
    event,
    data
  );


}









// =================================
// Emitir pasajero
// =================================


export function emitToPassenger(
  passengerId:string,
  event:string,
  data:any
){


  if(!io){

    console.log(
      "Socket no inicializado"
    );

    return;

  }



  console.log(
    `📡 PASSENGER ${passengerId}`,
    event
  );



  io.to(
    `passenger:${passengerId}`
  )
  .emit(
    event,
    data
  );


}









// =================================
// Emitir seguimiento del viaje
// =================================


export function emitToTrip(
  tripId:string,
  event:string,
  data:any
){


  if(!io){

    console.log(
      "Socket no inicializado"
    );

    return;

  }



  console.log(
    `📡 TRIP ${tripId}`,
    event
  );



  io.to(
    `trip:${tripId}`
  )
  .emit(
    event,
    data
  );


}