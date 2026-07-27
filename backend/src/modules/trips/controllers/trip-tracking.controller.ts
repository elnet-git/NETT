import { Response } from "express";

import { AuthRequest } from "../../../security/guards/auth.guard";
import { TripTrackingService } from "../services/trip-tracking.service";


const service = new TripTrackingService();



// =================================
// Actualizar ubicación conductor
//
// POST /trips/:tripId/location
// =================================

export async function updateLocation(

  req: AuthRequest,

  res: Response

){

  try {


    const tripId =

      String(req.params.tripId);



    if(!tripId){

      throw new Error(
        "TripId requerido"
      );

    }



    if(!req.user){

      throw new Error(
        "Usuario no autenticado"
      );

    }



    const {
      latitude,
      longitude
    } = req.body;



    if(
      latitude === undefined ||
      longitude === undefined
    ){

      throw new Error(
        "Latitud y longitud requeridas"
      );

    }



    const location =

      await service.updateDriverLocation({

        tripId,

        driverId:req.user.userId,

        latitude,

        longitude

      });



    res.json(location);



  }catch(error:any){


    res.status(400).json({

      message:error.message

    });


  }

}







// =================================
// Obtener última ubicación
//
// GET /trips/:tripId/location
// =================================

export async function getLastLocation(

  req:AuthRequest,

  res:Response

){

  try {


    const tripId =

      String(req.params.tripId);



    if(!req.user){

      throw new Error(
        "Usuario no autenticado"
      );

    }



    const location =

      await service.getLastLocation(

        tripId,

        req.user.userId

      );



    res.json(location);



  }catch(error:any){


    res.status(400).json({

      message:error.message

    });


  }

}







// =================================
// Historial ubicaciones
//
// GET /trips/:tripId/location/history
// =================================

export async function getLocationHistory(

  req:AuthRequest,

  res:Response

){

  try {


    const tripId =

      String(req.params.tripId);



    if(!req.user){

      throw new Error(
        "Usuario no autenticado"
      );

    }



    const history =

      await service.getHistory(

        tripId,

        req.user.userId

      );



    res.json(history);



  }catch(error:any){


    res.status(400).json({

      message:error.message

    });


  }

}