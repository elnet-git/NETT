import { prisma } from "../infrastructure/database/prisma.client";
import { getDistanceKm } from "./distance";

import {
  acquireDriverLock,
  releaseDriverLock
} from "../core/locks/redis-lock";


type DriverCandidate = {

  id:string;

  name:string;

  phone?:string;

  location:{
    lat:number;
    lng:number;
  };

  distance:number;

};





export async function matchDriver(
  trip:any,
  excludedDrivers:string[] = []
):Promise<DriverCandidate | null>{


  console.log(
    "MATCHER: buscando conductores"
  );


  console.log(
    "MATCHER EXCLUIDOS:",
    excludedDrivers
  );





  if(
    trip.originLatitude === null ||
    trip.originLatitude === undefined ||
    trip.originLongitude === null ||
    trip.originLongitude === undefined
  ){

    console.log(
      "MATCHER: viaje sin coordenadas"
    );

    return null;

  }





  const origin = {

    lat:Number(trip.originLatitude),

    lng:Number(trip.originLongitude)

  };









  const MAX_DISTANCE_KM = 100;









  console.log(
    "MATCHER DRIVER LOCATION ESTADO:",
    await prisma.driverLocation.findMany({
      select:{
        driverId:true,
        online:true,
        busy:true,
        latitude:true,
        longitude:true
      }
    })
  );









  const drivers =
    await prisma.driverLocation.findMany({

      where:{
        online:true,
        busy:false,
        driverId:{
          notIn:excludedDrivers
        }
      },

      include:{
        driver:{
          select:{
            id:true,
            name:true,
            phone:true
          }
        }
      }

    });




  console.log(
    "MATCHER DRIVERS RAW:",
    JSON.stringify(drivers,null,2)
  );






  if(drivers.length === 0){

    console.log(
      "MATCHER: no hay conductores online"
    );

    return null;

  }









  const candidates:DriverCandidate[] = [];








  for(const driverLocation of drivers){



    const user =
      driverLocation.driver;



    if(!user){

      continue;

    }








    if(

      driverLocation.latitude === null ||

      driverLocation.latitude === undefined ||

      driverLocation.longitude === null ||

      driverLocation.longitude === undefined

    ){

      console.log(
        "MATCHER: conductor sin ubicación",
        user.id
      );

      continue;

    }








    const distance =

      getDistanceKm(

        {

          lat:Number(driverLocation.latitude),

          lng:Number(driverLocation.longitude)

        },

        origin

      );






    console.log(
      "MATCHER DISTANCE CHECK:",
      {
        driverId:user.id,
        name:user.name,
        distanceKm:distance
      }
    );






    if(distance > MAX_DISTANCE_KM){

      console.log(
        "MATCHER FUERA DE RANGO:",
        user.id
      );

      continue;

    }








    candidates.push({

      id:user.id,

      name:user.name,

      phone:user.phone ?? undefined,


      location:{

        lat:Number(driverLocation.latitude),

        lng:Number(driverLocation.longitude)

      },


      distance:Number(

        distance.toFixed(4)

      )


    });




  }









  console.log(
    "MATCHER CANDIDATOS:",
    candidates
  );








  if(candidates.length === 0){


    console.log(

      "MATCHER: ningún conductor dentro del rango"

    );


    return null;


  }









  candidates.sort(

    (a,b)=>

      a.distance - b.distance

  );









  for(const candidate of candidates){



    console.log(
      "MATCHER INTENTANDO BLOQUEAR:",
      candidate.id
    );



    const locked =

      await acquireDriverLock(

        candidate.id

      );






    if(!locked){


      console.log(

        "MATCHER: conductor bloqueado",

        candidate.id

      );


      continue;


    }








    const reserved =

      await prisma.driverLocation.updateMany({

        where:{

          driverId:candidate.id,

          busy:false

        },


        data:{

          busy:true

        }


      });








    console.log(
      "MATCHER RESERVA RESULTADO:",
      {
        driverId:candidate.id,
        count:reserved.count
      }
    );








    if(reserved.count === 1){



      console.log(

        "MATCHER: conductor seleccionado",

        candidate

      );




      await releaseDriverLock(

        candidate.id

      );



      return candidate;



    }








    await releaseDriverLock(

      candidate.id

    );



    console.log(

      "MATCHER: liberando lock conductor",

      candidate.id

    );



  }









  console.log(

    "MATCHER: todos los conductores fueron reservados"

  );



  return null;



}