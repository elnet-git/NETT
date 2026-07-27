import { TripRepository } from "../repositories/trip.repository";
import { TripHistoryService } from "./trip-history.service";

import {
 startMatchingRetry
} from "../../../realtime/matching-retry";

import {
 prisma
} from "../../../infrastructure/database/prisma.client";

import {
  emitToPassenger,
  emitToDriver
} from "../../../realtime/socket";

import {
  publishEvent
} from "../../../infrastructure/redis/stream";

import {
  acquireDriverLock,
  releaseDriverLock,
  acquireTripLock,
  releaseTripLock
} from "../../../core/locks/redis-lock";

import {
  TripStatus
} from "../../../generated/prisma/client";

import {
  cancelTimeout,
  addExcludedDriver,
  clearExcludedDrivers
} from "../../../realtime/timeout-engine";




export class TripStateService {


  private repository =
    new TripRepository();


  private history =
    new TripHistoryService();




  // =====================================================
  // DRIVER_ASSIGNED
  //        |
  //        v
  // DRIVER_ACCEPTED
  // =====================================================


  async accept(

    tripId:string,

    driverId:string

  ){


    const tripLocked =
      await acquireTripLock(tripId);


    if(!tripLocked){

      throw new Error(
        "El viaje está siendo procesado"
      );

    }




    const locked =
      await acquireDriverLock(driverId);



    if(!locked){


      await releaseTripLock(tripId);


      throw new Error(
        "El conductor ya está procesando otro viaje"
      );

    }





    try {



      const trip =
        await this.repository.findById(tripId);



      if(!trip){

        throw new Error(
          "Viaje no encontrado"
        );

      }




      if(trip.driverId !== driverId){


        throw new Error(
          "Este viaje no pertenece al conductor"
        );

      }




      const activeTrip =

        await prisma.trip.findFirst({

          where:{

            driverId,

            status:{

              in:[

                TripStatus.DRIVER_ACCEPTED,

                TripStatus.DRIVER_ARRIVED,

                TripStatus.IN_PROGRESS

              ]

            }

          }

        });




      if(activeTrip){

        throw new Error(
          "El conductor ya tiene un viaje activo"
        );

      }





      if(

        trip.status !== TripStatus.DRIVER_ASSIGNED

      ){

        throw new Error(
          "El viaje ya no puede aceptarse"
        );

      }







      const updatedTrip =


        await this.repository.update(

          tripId,

          {

            status:

            TripStatus.DRIVER_ACCEPTED

          }

        );






      cancelTimeout(tripId);



      clearExcludedDrivers(tripId);






      await this.history.create(

        tripId,

        TripStatus.DRIVER_ACCEPTED,

        undefined,

        driverId

      );






      await prisma.driverLocation.updateMany({


        where:{

          driverId

        },


        data:{

          busy:true

        }


      });







      await publishEvent(

        "trip.accepted",

        updatedTrip

      );







      emitToPassenger(

        updatedTrip.passengerId,

        "trip:accepted",

        updatedTrip

      );







      if(updatedTrip.driverId){


        emitToDriver(

          updatedTrip.driverId,

          "trip:accepted",

          updatedTrip

        );

      }






      return updatedTrip;



    } finally {


      await releaseDriverLock(driverId);


      await releaseTripLock(tripId);


    }


  }














  // =====================================================
  // DRIVER REJECT
  //
  // DRIVER_ASSIGNED
  //        |
  //        v
  // MATCHING
  //        |
  //        v
  // DRIVER_ASSIGNED
  //
  // =====================================================



  async reject(


    tripId:string,


    driverId:string


  ){



    const locked =

      await acquireTripLock(tripId);




    if(!locked){


      throw new Error(

        "El viaje está siendo procesado"

      );


    }





    try {



      const trip =


        await this.repository.findById(tripId);





      if(!trip){


        throw new Error(

          "Viaje no encontrado"

        );

      }







      if(trip.driverId !== driverId){


        throw new Error(

          "Este viaje no pertenece al conductor"

        );

      }







      if(

        trip.status !== TripStatus.DRIVER_ASSIGNED

      ){


        throw new Error(

          "El viaje ya no puede rechazarse"

        );


      }







      // =====================================
      // CANCELAR TIMEOUT
      // =====================================


      cancelTimeout(tripId);







      // =====================================
      // LIBERAR CONDUCTOR
      // =====================================


      await prisma.driverLocation.updateMany({


        where:{


          driverId


        },


        data:{


          busy:false


        }


      });






      const updated =


        await this.repository.update(


          tripId,


          {


            status:


            TripStatus.MATCHING,



            driver:{


              disconnect:true


            }


          }


        );







      await this.history.create(


        tripId,


        TripStatus.MATCHING,


        "Conductor rechazó el viaje",


        driverId


      );







      await publishEvent(


        "trip.rejected",


        {

          tripId,

          driverId

        }


      );








      // =====================================
      // AVISAR AL PASAJERO
      // =====================================


      emitToPassenger(


        trip.passengerId,


        "trip:searching_driver",


        {


          tripId,


          status:TripStatus.MATCHING


        }


      );








      // =====================================
      // EXCLUIR CONDUCTOR
      // =====================================


      addExcludedDriver(

        tripId,

        driverId

      );








      // =====================================
      // NUEVO MATCHING
      // =====================================


      startMatchingRetry(


        tripId,


        3000


      );






      return updated;





    } finally {


      await releaseTripLock(tripId);


    }


  }

    // =====================================================
  // DRIVER_ACCEPTED
  //        |
  //        v
  // DRIVER_ARRIVED
  // =====================================================


  async arrived(


    tripId:string,


    driverId:string


  ){


    const locked =

      await acquireTripLock(tripId);



    if(!locked){


      throw new Error(

        "El viaje está siendo procesado"

      );


    }




    try {



      const trip =


        await this.repository.findById(tripId);




      if(!trip){


        throw new Error(

          "Viaje no encontrado"

        );

      }






      if(trip.driverId !== driverId){


        throw new Error(

          "Este viaje no pertenece al conductor"

        );

      }







      if(

        trip.status !== TripStatus.DRIVER_ACCEPTED

      ){


        throw new Error(

          "Primero debe aceptar el viaje"

        );


      }







      const updatedTrip =


        await this.repository.update(


          tripId,


          {


            status:


            TripStatus.DRIVER_ARRIVED


          }


        );







      await this.history.create(


        tripId,


        TripStatus.DRIVER_ARRIVED,


        undefined,


        driverId


      );







      await publishEvent(


        "trip.driver_arrived",


        updatedTrip


      );







      emitToPassenger(


        updatedTrip.passengerId,


        "trip:arrived",


        updatedTrip


      );







      return updatedTrip;






    } finally {



      await releaseTripLock(tripId);



    }


  }













  // =====================================================
  // DRIVER_ARRIVED
  //        |
  //        v
  // IN_PROGRESS
  // =====================================================



  async start(


    tripId:string,


    driverId:string


  ){



    const locked =

      await acquireTripLock(tripId);





    if(!locked){


      throw new Error(

        "El viaje está siendo procesado"

      );


    }





    try {



      const trip =


        await this.repository.findById(tripId);





      if(!trip){


        throw new Error(

          "Viaje no encontrado"

        );


      }







      if(trip.driverId !== driverId){


        throw new Error(

          "Este viaje no pertenece al conductor"

        );


      }







      if(

        trip.status !== TripStatus.DRIVER_ARRIVED

      ){


        throw new Error(

          "El conductor aún no llegó"

        );


      }







      const updatedTrip =


        await this.repository.update(


          tripId,


          {


            status:


            TripStatus.IN_PROGRESS


          }


        );







      await this.history.create(


        tripId,


        TripStatus.IN_PROGRESS,


        undefined,


        driverId


      );







      await publishEvent(


        "trip.started",


        updatedTrip


      );







      emitToPassenger(


        updatedTrip.passengerId,


        "trip:started",


        updatedTrip


      );







      if(updatedTrip.driverId){



        emitToDriver(


          updatedTrip.driverId,


          "trip:started",


          updatedTrip


        );

      }







      return updatedTrip;






    } finally {



      await releaseTripLock(tripId);



    }


  }













  // =====================================================
  // IN_PROGRESS
  //        |
  //        v
  // COMPLETED
  // =====================================================



  async complete(


    tripId:string,


    driverId:string


  ){



    const locked =


      await acquireTripLock(tripId);





    if(!locked){


      throw new Error(

        "El viaje está siendo procesado"

      );


    }







    try {



      const trip =


        await this.repository.findById(tripId);





      if(!trip){


        throw new Error(

          "Viaje no encontrado"

        );


      }







      if(trip.driverId !== driverId){


        throw new Error(

          "Este viaje no pertenece al conductor"

        );


      }







      if(

        trip.status !== TripStatus.IN_PROGRESS

      ){


        throw new Error(

          "El viaje no está en progreso"

        );


      }







      const updatedTrip =


        await this.repository.update(


          tripId,


          {


            status:


            TripStatus.COMPLETED


          }


        );







      await this.history.create(


        tripId,


        TripStatus.COMPLETED,


        undefined,


        driverId


      );







      // =====================================
      // LIBERAR CONDUCTOR
      // =====================================


      await prisma.driverLocation.updateMany({


        where:{


          driverId


        },


        data:{


          busy:false,


          online:true


        }


      });







      // =====================================
      // LIMPIAR EXCLUSIONES
      // =====================================


      clearExcludedDrivers(tripId);







      await publishEvent(


        "trip.completed",


        updatedTrip


      );







      emitToPassenger(


        updatedTrip.passengerId,


        "trip:completed",


        updatedTrip


      );







      if(updatedTrip.driverId){



        emitToDriver(


          updatedTrip.driverId,


          "trip:completed",


          updatedTrip


        );


      }







      return updatedTrip;






    } finally {



      await releaseTripLock(tripId);



    }


  }

    // =====================================================
  // CANCELAR VIAJE
  // =====================================================


  async cancel(


    tripId:string,


    userId:string,


    reason?:string


  ){



    const trip =


      await this.repository.findById(tripId);





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

        "No tienes permiso"

      );


    }








    const cancellableStatuses:TripStatus[] = [


      TripStatus.PENDING,


      TripStatus.MATCHING,


      TripStatus.DRIVER_ASSIGNED,


      TripStatus.DRIVER_ACCEPTED,


      TripStatus.DRIVER_ARRIVED,


      TripStatus.EXPIRED


    ];







    if(


      !cancellableStatuses.includes(


        trip.status


      )


    ){


      throw new Error(

        "El viaje ya no puede cancelarse"

      );


    }








    // =====================================
    // CANCELAR PROCESOS ACTIVOS
    // =====================================


    cancelTimeout(tripId);


    clearExcludedDrivers(tripId);









    // =====================================
    // LIBERAR CONDUCTOR SI EXISTE
    // =====================================


    if(trip.driverId){



      await prisma.driverLocation.updateMany({


        where:{


          driverId:trip.driverId


        },


        data:{


          busy:false,


          online:true


        }


      });


    }









    const cancelledBy =


      trip.passengerId === userId


      ? "CLIENT"


      : "DRIVER";









    console.log(

      "CANCELANDO VIAJE:",

      {

        tripId,

        cancelledBy,

        reason

      }

    );









    const updatedTrip =


      await this.repository.update(


        tripId,


        {


          status:


          TripStatus.CANCELLED,



          cancelledBy,



          cancelReason:


          reason ?? "Sin motivo",



          cancelledAt:


          new Date()


        }


      );









    await this.history.create(


      tripId,


      TripStatus.CANCELLED,


      reason ?? "Viaje cancelado",


      trip.driverId ?? undefined


    );









    await publishEvent(


      "trip.cancelled",


      updatedTrip


    );









    emitToPassenger(


      updatedTrip.passengerId,


      "trip:cancelled",


      updatedTrip


    );









    if(updatedTrip.driverId){



      emitToDriver(


        updatedTrip.driverId,


        "trip:cancelled",


        updatedTrip


      );


    }









    return updatedTrip;



  }





}