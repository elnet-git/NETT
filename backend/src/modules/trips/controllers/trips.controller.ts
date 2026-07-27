import { TripsService } from "../services/trips.service";
import { Request, Response } from "express";


const service = new TripsService();



// =====================================
// Crear viaje
// =====================================

export const createTrip = async (
  req:any,
  res:any
)=>{

  console.log("\n========== CREATE TRIP ==========");
  console.log("req.user:");
  console.log(req.user);

  console.log("req.body:");
  console.log(req.body);


  try{


    const {

      origin,

      destination,

      originLatitude,

      originLongitude,

      destinationLatitude,

      destinationLongitude


    } = req.body;




    if(

      originLatitude === undefined ||

      originLongitude === undefined ||

      destinationLatitude === undefined ||

      destinationLongitude === undefined

    ){

      console.log("❌ Faltan coordenadas");


      return res.status(400).json({

        message:
        "Las coordenadas de origen y destino son obligatorias"

      });

    }



    console.log("PassengerId:");
    console.log(req.user?.userId);



    const trip =

      await service.createTrip({

        origin,

        destination,

        originLatitude,

        originLongitude,

        destinationLatitude,

        destinationLongitude,

        passengerId:req.user.userId

      });



    console.log("✅ Viaje creado correctamente");

    console.log(trip);



    return res.json(trip);



  }catch(error:any){


    console.log("❌ ERROR EN createTrip()");

    console.log(error);



    return res.status(400).json({

      message:error.message

    });


  }


};








// =====================================
// Obtener viajes
// =====================================

export const getTrips = async (
  req:any,
  res:any
)=>{


  console.log("\n========== GET TRIPS ==========");



  try{


    const trips =

      await service.getTrips();



    console.log(
      "Cantidad de viajes:",
      trips.length
    );



    return res.json(trips);



  }catch(error:any){


    console.log("❌ ERROR EN getTrips()");

    console.log(error);



    return res.status(500).json({

      message:error.message

    });


  }


};








// =====================================
// Viajes del conductor
// =====================================

export const getDriverTrips = async (
 req:any,
 res:any
)=>{


 try{


   const trips =

     await service.getDriverTrips(
       req.user.userId
     );



   return res.json(trips);



 }catch(error:any){


   return res.status(400).json({

     message:error.message

   });


 }


};








// =====================================
// Obtener viaje por ID
// GET /trips/:tripId
// =====================================

export async function getTripById(
  req: Request,
  res: Response
){


  try {


    const tripId = String(req.params.tripId);


    const trip =

      await service.getById(
        tripId
      );




    if(!trip){


      return res.status(404).json({

        message:
        "Viaje no encontrado"

      });


    }



    return res.json(trip);



  }catch(error:any){


    console.error(error);



    return res.status(500).json({

      message:
      error.message

    });


  }


}


// =====================================
// Obtener viaje activo del cliente
// GET /trips/active
// =====================================

export const getActiveTrip = async (
  req:any,
  res:any
)=>{

  try{

    const passengerId = req.user.userId;


    const trip =
      await service.getActiveTrip(
        passengerId
      );


    return res.json(trip);


  }catch(error:any){


    console.error(error);


    return res.status(400).json({

      message:error.message

    });


  }

};
