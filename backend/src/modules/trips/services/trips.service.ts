import { 
  emitToPassenger,
  emitToDriver 
} from "../../../realtime/socket";

import { prisma } from "../../../infrastructure/database/prisma.client";

import { publishEvent } from "../../../infrastructure/redis/stream";

import { matchDriver } from "../../../matching/matcher.service";

import { startTimeout } from "../../../realtime/timeout-engine";
import { 
  startMatchingRetry 
} from "../../../realtime/matching-retry";

import {
  addExcludedDriver,
  getExcludedDrivers
} from "../../../realtime/timeout-engine";

import { TripRepository } from "../repositories/trip.repository";
import { TripHistoryService } from "./trip-history.service";
import { TripStatus } from "../../../generated/prisma/client";




export class TripsService {


  private history = new TripHistoryService();


  constructor(
    private tripRepository = new TripRepository()
  ){}



  async createTrip(
    data:any
  ){

    const activeTrip = await prisma.trip.findFirst({

  where:{

    passengerId:data.passengerId,

    status:{
      in:[
        TripStatus.PENDING,
        TripStatus.MATCHING,
        TripStatus.DRIVER_ASSIGNED,
        TripStatus.DRIVER_ACCEPTED,
        TripStatus.DRIVER_ARRIVED,
        TripStatus.IN_PROGRESS
      ]
    }

  }

});


if(activeTrip){

  throw new Error(
    "El cliente ya tiene un viaje activo"
  );

}

    const trip = await prisma.trip.create({


      data:{


        origin:data.origin,

        destination:data.destination,


        originLatitude:data.originLatitude,

        originLongitude:data.originLongitude,


        destinationLatitude:data.destinationLatitude,

        destinationLongitude:data.destinationLongitude,


        passengerId:data.passengerId,


        status:TripStatus.PENDING


      }


    });

    await prisma.user.update({

  where:{
    id:data.passengerId
  },

  data:{
    busy:true
  }

});



    console.log(
      "TRIP CREATED:",
      trip.id
    );





    await this.history.create(

      trip.id,

      TripStatus.PENDING

    );






    await publishEvent(

      "trip.created",

      trip

    );


    await this.matchTrip(trip.id);


const updatedTrip = await prisma.trip.findUnique({

  where:{
    id:trip.id
  },

  include:{

    passenger:{
      select:{
        id:true,
        name:true,
        email:true,
        phone:true,
        status:true
      }
    },

    driver:{
      select:{
        id:true,
        name:true,
        email:true,
        phone:true,
        status:true
      }
    }

  }

});


return updatedTrip;

}


async getById(
  tripId:string
){

  return this.tripRepository.findById(
    tripId
  );




}


  async matchTrip(tripId:string){



    console.log(
      "MATCHER: buscando conductores"
    );



    let assignedDriverId:string | null = null;





    try{



      /*
      =====================================
      CAMBIAR A MATCHING
      =====================================
      */


      await prisma.trip.update({


        where:{
          id:tripId
        },


        data:{


          status:TripStatus.MATCHING


        }


      });







      await this.history.create(

        tripId,

        TripStatus.MATCHING

      );








      /*
      =====================================
      RECARGAR VIAJE ACTUALIZADO
      =====================================
      */


      const trip = await prisma.trip.findUnique({


        where:{
          id:tripId
        }


      });





      if(!trip){


        console.log(
          "MATCHER: viaje no existe"
        );


        return;


      }









      /*
      =====================================
      BUSCAR CONDUCTOR
      =====================================
      */


      const excludedDrivers =

  getExcludedDrivers(

    tripId

  );



const driver = await matchDriver(

  trip,

  excludedDrivers

);







      if(!driver){



        console.log(
          "MATCHER: no hay conductores disponibles"
        );





     startMatchingRetry(
  tripId,
  30000
);



        return;


      }








      assignedDriverId = driver.id;


addExcludedDriver(

  tripId,

  driver.id

);





      console.log(

        "MATCHER: conductor seleccionado",

        driver.id

      );









      /*
      =====================================
      ASIGNAR CONDUCTOR
      =====================================
      */



      const assignedTrip = await prisma.trip.update({

  where:{
    id:tripId
  },

  data:{
    driverId:driver.id,
    status:TripStatus.DRIVER_ASSIGNED
  },

  include:{
    passenger:{
      select:{
        id:true,
        name:true,
        email:true,
        phone:true,
        status:true
      }
    },

    driver:{
      select:{
        id:true,
        name:true,
        email:true,
        phone:true,
        status:true
      }
    }
  }

});







      await this.history.create(


        tripId,


        TripStatus.DRIVER_ASSIGNED,


        undefined,


        driver.id


      );









      /*
      =====================================
      TIMEOUT ACEPTACIÓN
      =====================================
      */


      startTimeout(

        tripId,

        20000

      );









      await publishEvent(


        "trip.driver_assigned",


        {


          tripId:tripId,


          driverId:driver.id


        }


      );









      emitToDriver(


        driver.id,


        "trip:new",


        assignedTrip


      );









      emitToPassenger(


        assignedTrip.passengerId,


        "trip:assigned",


        assignedTrip


      );









      console.log(

        "MATCHER: viaje asignado correctamente",

        tripId,

        "->",

        driver.id

      );








    }

    catch(error:any){



      console.error(

        "MATCHER ERROR:",

        error

      );





      if(assignedDriverId){



        await prisma.driverLocation.updateMany({

        

          where:{


            driverId:assignedDriverId


          },


          data:{


            busy:false,

            online:true

          }



        });


      }



      throw error;


    }


  }









  async getTrips(){

  return await prisma.trip.findMany({

    include:{

      passenger:{
        select:{
          id:true,
          name:true,
          email:true,
          phone:true,
          status:true
        }
      },

      driver:{
        select:{
          id:true,
          name:true,
          email:true,
          phone:true,
          status:true
        }
      }

    }

  });

}

    async getDriverTrips(driverId:string){

    console.log(

      "BUSCANDO VIAJES DRIVER:",

      driverId

    );





    const trips = await prisma.trip.findMany({



      where:{


        driverId:driverId,


        status:TripStatus.DRIVER_ASSIGNED


      },



      include:{

 passenger:{
   select:{
     id:true,
     name:true,
     email:true,
     phone:true,
     status:true
   }
 },

 driver:{
   select:{
     id:true,
     name:true,
     email:true,
     phone:true,
     status:true
   }
 }

},



      orderBy:{


        createdAt:"desc"


      }



    });





    console.log(

      "VIAJES DISPONIBLES:",

      trips.length

    );





    return trips;


  }


  // =====================================
  // Obtener viaje activo del cliente
  // =====================================

  async getActiveTrip(
  passengerId:string
){

return await prisma.trip.findFirst({

  where:{

    passengerId,

    status:{
      in:[
        TripStatus.PENDING,
        TripStatus.MATCHING,
        TripStatus.DRIVER_ASSIGNED,
        TripStatus.DRIVER_ACCEPTED,
        TripStatus.DRIVER_ARRIVED,
        TripStatus.IN_PROGRESS
      ]
    }

  },


  include:{

    passenger:{
      select:{
        id:true,
        name:true,
        email:true,
        phone:true,
        status:true
      }
    },


    driver:{
      select:{
        id:true,
        name:true,
        email:true,
        phone:true,
        status:true
      }
    }

  }


});

}


} // ESTE CIERRA TripsService





