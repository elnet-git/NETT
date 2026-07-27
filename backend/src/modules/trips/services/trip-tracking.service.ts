import { prisma } from "../../../infrastructure/database/prisma.client";
import { emitToTrip } from "../../../realtime/socket";

import {
  TripStatus
} from "../../../generated/prisma/client";


interface DriverLocationInput {

  tripId:string;

  driverId:string;

  latitude:number;

  longitude:number;

}





export class TripTrackingService {



  // =================================
  // Actualizar ubicación conductor
  // =================================


  async updateDriverLocation(

    data:DriverLocationInput

  ){


    const {

      tripId,

      driverId,

      latitude,

      longitude

    } = data;




    // ==============================
    // Validar coordenadas
    // ==============================


    if(

      typeof latitude !== "number" ||

      typeof longitude !== "number"

    ){

      throw new Error(

        "Coordenadas inválidas"

      );

    }



    if(

      Number.isNaN(latitude) ||

      Number.isNaN(longitude)

    ){

      throw new Error(

        "Coordenadas inválidas"

      );

    }



    if(

      latitude < -90 ||

      latitude > 90 ||

      longitude < -180 ||

      longitude > 180

    ){

      throw new Error(

        "Coordenadas fuera de rango"

      );

    }




    // ==============================
    // Buscar viaje
    // ==============================


    const trip =

      await prisma.trip.findUnique({

        where:{

          id:tripId

        }

      });





    console.log(
      "========== TRACKING DEBUG =========="
    );


    console.log(

      "TRIP ID:",

      tripId

    );


    console.log(

      "DB DRIVER ID:",

      trip?.driverId

    );


    console.log(

      "TOKEN DRIVER ID:",

      driverId

    );


    console.log(

      "TRIP STATUS:",

      trip?.status

    );


    console.log(
      "====================================="
    );






    if(!trip){

      throw new Error(

        "Viaje no encontrado"

      );

    }






    // ==============================
    // Validar conductor asignado
    // ==============================


    if(

      !trip.driverId ||

      trip.driverId !== driverId

    ){

      throw new Error(

        "El conductor no pertenece al viaje"

      );

    }





    // ==============================
    // Validar estado del viaje
    // ==============================


    const allowedStatus:TripStatus[] = [


      TripStatus.DRIVER_ASSIGNED,


      TripStatus.DRIVER_ACCEPTED,


      TripStatus.DRIVER_ARRIVED,


      TripStatus.IN_PROGRESS


    ];





    if(

      !allowedStatus.includes(

        trip.status

      )

    ){

      throw new Error(

        "El viaje no permite seguimiento"

      );

    }





    // ==============================
    // Verificar conductor activo
    // ==============================


    const driverLocation =

      await prisma.driverLocation.findUnique({

        where:{

          driverId

        }

      });





    if(!driverLocation){

      throw new Error(

        "Conductor sin ubicación activa"

      );

    }

        // ==============================
    // Guardar ubicación histórica
    // ==============================


    const location =

      await prisma.tripLocation.create({

        data:{

          tripId,

          driverId,

          latitude,

          longitude

        }

      });







    // ==============================
    // Actualizar última ubicación conductor
    //
    // Existe  → UPDATE
    // No existe → CREATE
    // ==============================



    await prisma.driverLocation.upsert({


      where:{


        driverId


      },


      update:{


        latitude,


        longitude,


        online:true,


        busy:true


      },


      create:{


        driverId,


        latitude,


        longitude,


        online:true,


        busy:true


      }


    });







    // ==============================
    // Emitir tiempo real
    // ==============================


    emitToTrip(


      tripId,


      "driver:location",


      {


        latitude,


        longitude,


        timestamp:Date.now()


      }


    );





    return location;



  }









  // =================================
  // Obtener última ubicación
  // =================================



  async getLastLocation(

    tripId:string,

    userId:string

  ){


    const trip =

      await prisma.trip.findUnique({


        where:{

          id:tripId

        }


      });





    if(!trip){


      throw new Error(

        "Viaje no encontrado"

      );


    }






    if(

      trip.passengerId !== userId &&

      trip.driverId !== userId

    ){


      throw new Error(

        "No tienes acceso a este viaje"

      );


    }





    return await prisma.tripLocation.findFirst({


      where:{


        tripId


      },


      orderBy:{


        createdAt:"desc"


      }


    });



  }

    // =================================
  // Obtener historial completo
  // =================================



  async getHistory(

    tripId:string,

    userId:string

  ){



    const trip =

      await prisma.trip.findUnique({


        where:{


          id:tripId


        }


      });





    if(!trip){


      throw new Error(

        "Viaje no encontrado"

      );


    }






    if(

      trip.passengerId !== userId &&

      trip.driverId !== userId

    ){


      throw new Error(

        "No tienes acceso a este viaje"

      );


    }





    return await prisma.tripLocation.findMany({


      where:{


        tripId


      },


      orderBy:{


        createdAt:"asc"


      }


    });



  }



}

