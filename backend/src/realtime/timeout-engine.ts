import { prisma } from "../infrastructure/database/prisma.client";
import { matchDriver } from "../matching/matcher.service";
import { TripStatus } from "../generated/prisma/client";

import {
  emitToPassenger,
  emitToDriver
} from "./socket";

import {
  publishEvent
} from "../infrastructure/redis/stream";

import {
  TripHistoryService
} from "../modules/trips/services/trip-history.service";

import {
  startMatchingRetry,
  cancelMatchingRetry
} from "./matching-retry";



const history =
  new TripHistoryService();





/*
==================================
TIMEOUTS ACTIVOS
==================================
*/


const activeTimeouts =
  new Map<string, NodeJS.Timeout>();





/*
==================================
CONDUCTORES EXCLUIDOS POR VIAJE
==================================
*/


const excludedByTrip =
  new Map<string,string[]>();




export function clearExcludedDrivers(
  tripId:string
){

  excludedByTrip.delete(tripId);

}





export function addExcludedDriver(

  tripId:string,

  driverId:string

){


  const current =
    excludedByTrip.get(tripId) || [];



  excludedByTrip.set(

    tripId,

    [

      ...new Set(

        [

          ...current,

          driverId

        ]

      )

    ]

  );



  console.log(

    "🚫 DRIVER EXCLUIDO:",

    tripId,

    excludedByTrip.get(tripId)

  );


}






export function getExcludedDrivers(

  tripId:string

){

  return (

    excludedByTrip.get(tripId) || []

  );

}







/*
==================================
CANCELAR TIMEOUT
==================================
*/


export function cancelTimeout(

  tripId:string

){


  const timeout =
    activeTimeouts.get(tripId);



  if(timeout){


    clearTimeout(timeout);


    activeTimeouts.delete(tripId);



    console.log(

      "TIMEOUT CANCELADO:",

      tripId

    );


  }


}









/*
==================================
START TIMEOUT
==================================
*/


export function startTimeout(

  tripId:string,

  ms:number

){



  console.log(

    "⏰ TIMEOUT PROGRAMADO:",

    tripId,

    "MS:",

    ms

  );





  cancelTimeout(tripId);






  const timeout = setTimeout(async()=>{



    if(!activeTimeouts.has(tripId)){

      return;

    }





    activeTimeouts.delete(tripId);





    console.log(

      "⏱ TIMEOUT EJECUTANDO:",

      tripId

    );





    try{



      const trip =

        await prisma.trip.findUnique({

          where:{
            id:tripId
          }

        });






      if(!trip){


        console.log(

          "TIMEOUT: viaje inexistente"

        );


        return;


      }






      console.log(

        "TIMEOUT STATUS:",

        trip.status,

        "DRIVER:",

        trip.driverId

      );







      /*
      ==================================
      VALIDAR ESTADO
      ==================================
      */


      if(

        trip.status !== TripStatus.DRIVER_ASSIGNED

      ){


        console.log(

          "TIMEOUT CANCELADO POR ESTADO:",

          trip.status

        );


        return;


      }







      const oldDriver =
        trip.driverId;







      /*
      ==================================
      EXCLUIR DRIVER ANTERIOR
      ==================================
      */


      if(oldDriver){


        addExcludedDriver(

          tripId,

          oldDriver

        );


      }







      /*
      ==================================
      LIBERAR DRIVER
      ==================================
      */


      if(oldDriver){


        await prisma.driverLocation.updateMany({

          where:{

            driverId:oldDriver

          },


          data:{

            busy:false,

            online:true

          }

        });



        console.log(

          "DRIVER LIBERADO:",

          oldDriver

        );


      }







      /*
      ==================================
      PASAR A MATCHING
      ==================================
      */


      const waiting =


        await prisma.trip.update({


          where:{

            id:tripId

          },


          data:{


            driverId:null,


            status:

              TripStatus.MATCHING


          },


          include:{


            passenger:true


          }


        });







      await history.create(

        tripId,

        TripStatus.MATCHING

      );








      await publishEvent(

        "trip.matching",

        waiting

      );






      emitToPassenger(

        waiting.passengerId,

        "trip:searching_driver",

        waiting

      );





      console.log(

        "🔄 VIAJE EN MATCHING:",

        tripId

      );







      await new Promise(resolve=>

        setTimeout(resolve,1000)

      );







      /*
      ==================================
      NUEVO MATCH
      ==================================
      */


      const excludedDrivers =

        getExcludedDrivers(tripId);





      const newDriver =

        await matchDriver(

          waiting,

          excludedDrivers

        );






      console.log(

        "NUEVO DRIVER:",

        newDriver,

        "EXCLUIDOS:",

        excludedDrivers

      );







      if(newDriver){


        const reassigned =


          await prisma.trip.update({


            where:{

              id:tripId

            },


            data:{


              driverId:newDriver.id,


              status:

                TripStatus.DRIVER_ASSIGNED


            },


            include:{


              passenger:true,

              driver:true


            }


          });







        await prisma.driverLocation.updateMany({

          where:{

            driverId:newDriver.id

          },


          data:{

            busy:true

          }

        });








        await history.create(

          tripId,

          TripStatus.DRIVER_ASSIGNED,

          undefined,

          newDriver.id

        );








        await publishEvent(

          "trip.reassigned",

          reassigned

        );







        emitToDriver(

          newDriver.id,

          "trip:new",

          reassigned

        );







        emitToPassenger(

          reassigned.passengerId,

          "trip:driver_changed",

          reassigned

        );







        console.log(

          "✅ REASIGNADO:",

          newDriver.id

        );







        startTimeout(

          tripId,

          30000

        );


        return;


      }

            /*
      ==================================
      SIN CONDUCTOR DISPONIBLE
      ==================================
      */


      console.log(

        "⏳ TIMEOUT: sin conductor disponible"

      );




      /*
      ==================================
      CONTINUAR CON RETRY
      ==================================
      */


      startMatchingRetry(

        tripId,

        30000

      );





    }

    catch(error){


      console.error(

        "❌ TIMEOUT ERROR:",

        error

      );


    }



  },ms);






  activeTimeouts.set(

    tripId,

    timeout

  );

}








/*
==================================
LIMPIAR VIAJE COMPLETADO
==================================
*/


export function clearTripTimeoutData(

  tripId:string

){

  cancelTimeout(tripId);


  cancelMatchingRetry(tripId);


  clearExcludedDrivers(tripId);



  console.log(

    "🧹 ESTADO LIMPIADO DEL VIAJE:",

    tripId

  );


}