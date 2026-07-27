import { matchDriver } from "../matching/matcher.service";
import { prisma } from "../infrastructure/database/prisma.client";
import { TripStatus } from "../generated/prisma/client";
import {
  getExcludedDrivers,
  cancelTimeout,
  startTimeout
} from "./timeout-engine";

import {
    publishEvent
} from "../infrastructure/redis/stream";

import {
    emitToDriver,
    emitToPassenger
} from "./socket";

import {
    TripHistoryService
} from "../modules/trips/services/trip-history.service";



const history =
    new TripHistoryService();











// ======================================
// RETRIES ACTIVOS
// EVITA MULTIPLES RETRIES DEL MISMO VIAJE
// ======================================



const activeRetries =
    new Map<string,NodeJS.Timeout>();


const retryAttempts =
    new Map<string,number>();


// ======================================
// INTENTOS DE MATCHING POR VIAJE
// ======================================




const MAX_RETRIES = 5;





// ======================================
// CANCELAR RETRY ACTIVO
// ======================================


export function cancelMatchingRetry(
    tripId:string
){


    const retry =
        activeRetries.get(tripId);



    if(retry){


        clearTimeout(retry);



        activeRetries.delete(tripId);



        console.log(

            "🛑 MATCHING RETRY CANCELADO:",

            tripId

        );

    }




    retryAttempts.delete(tripId);

}









export function startMatchingRetry(
    tripId:string,
    ms:number = 30000
){



    /*
    ======================================
    EVITAR DUPLICAR RETRIES
    ======================================
    */


    if(activeRetries.has(tripId)){


        console.log(

            "⚠️ RETRY YA EXISTE:",

            tripId

        );


        return;


    }



    const retry =


        setTimeout(async()=>{



            activeRetries.delete(tripId);



            try{



                console.log(


                    "🔄 MATCHING RETRY EJECUTANDO:",


                    tripId


                );








                const trip =


                    await prisma.trip.findUnique({



                        where:{


                            id:tripId


                        }


                    });








                if(!trip){



                    console.log(


                        "RETRY: viaje no existe"


                    );



                

                    retryAttempts.delete(tripId);



                    return;



                }









                if(

    trip.status !== TripStatus.MATCHING &&
    trip.status !== TripStatus.PENDING

){

    console.log(

        "RETRY CANCELADO:",

        trip.status

    );


    

    retryAttempts.delete(tripId);


    return;

}

// ======================================
// CAMBIAR NUEVAMENTE A MATCHING
// ======================================

if(trip.status === TripStatus.PENDING){

    await prisma.trip.update({

        where:{
            id:tripId
        },

        data:{
            status:TripStatus.MATCHING
        }

    });


    await history.create(

        tripId,

        TripStatus.MATCHING

    );


    trip.status = TripStatus.MATCHING;

}









                /*
                ======================================
                CONDUCTORES EXCLUIDOS
                ======================================
                */


                const excludedDrivers =
                    getExcludedDrivers(tripId);







                /*
                ======================================
                BUSCAR CONDUCTOR
                ======================================
                */


                const driver =


                    await matchDriver(


                        trip,


                        excludedDrivers


                    );

                    console.log(
    "RETRY EXCLUDED:",
    excludedDrivers
);


console.log(
    "RETRY TRIP COORDS:",
    {
        lat:trip.originLatitude,
        lng:trip.originLongitude
    }
);








                console.log(



                    "RETRY DRIVER:",



                    driver,



                    "EXCLUIDOS:",



                    excludedDrivers



                );









                /*
                ======================================
                NO HAY CONDUCTOR
                ======================================
                */


                if(!driver){


                    const attempts =

                        (retryAttempts.get(tripId) || 0) + 1;



                    retryAttempts.set(

                        tripId,

                        attempts

                    );



                    console.log(


                        "RETRY SIN CONDUCTOR:",


                        attempts,


                        "/",


                        MAX_RETRIES


                    );




                    if(attempts >= MAX_RETRIES){



                        console.log(


                            "🚫 VIAJE EXPIRADO:",


                            tripId


                        );



                        const expired =


                            await prisma.trip.update({



                                where:{


                                    id:tripId


                                },


                                data:{


                                    status:
                                    TripStatus.EXPIRED


                                }



                            });





                        await history.create(



                            tripId,



                            TripStatus.EXPIRED



                        );





                        await publishEvent(



                            "trip.expired",



                            expired



                        );





                        emitToPassenger(



                            trip.passengerId,



                            "trip:expired",



                            expired



                        );




                        cancelTimeout(tripId);

                        retryAttempts.delete(tripId);



                        return;


                    }



                    startMatchingRetry(


                        tripId,


                        ms,

                    );



                    return;


                }

                /*
                ======================================
                ASIGNAR CONDUCTOR
                ======================================
                */

                const updated =


                    await prisma.trip.update({



                        where:{



                            id:tripId



                        },



                        data:{



                            driverId:driver.id,



                            status:



                            TripStatus.DRIVER_ASSIGNED



                        },



                        include:{



                            passenger:true,



                            driver:true



                        }



                    });

 
                await history.create(



                    tripId,



                    TripStatus.DRIVER_ASSIGNED,



                    undefined,



                    driver.id



                );









                await publishEvent(



                    "trip.driver_assigned",



                    updated



                );









                emitToDriver(



                    driver.id,



                    "trip:new",



                    updated



                );









                emitToPassenger(



                    updated.passengerId,



                    "trip:driver_changed",



                    updated



                );









                console.log(



                    "✅ RETRY: conductor encontrado",



                    driver.id



                );









                /*
                ======================================
                LIMPIAR ESTADO
                ======================================
                */


                


                retryAttempts.delete(



                    tripId



                );









                /*
                ======================================
                NUEVO TIMEOUT
                ======================================
                */


                cancelTimeout(tripId);

startTimeout(
  tripId,
  30000
);
            }



            catch(error){



                console.error(



                    "❌ ERROR MATCHING RETRY:",



                    error



                );





                startMatchingRetry(



                    tripId,



                    ms,

                );



            }




        },ms);









    activeRetries.set(



        tripId,



        retry



    );



}