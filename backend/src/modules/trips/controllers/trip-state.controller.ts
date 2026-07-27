import { TripStateService } from "../services/trip-state.service";


const service = new TripStateService();


// =====================================
// Aceptar viaje
// DRIVER_ASSIGNED
//        ↓
// DRIVER_ACCEPTED
// =====================================

export const acceptTrip = async (
  req: any,
  res: any
) => {

  console.log("====== ACCEPT CONTROLLER ======");
  console.log("tripId:", req.params.tripId);
  console.log("driver:", req.user.userId);

  try {

    const trip =
      await service.accept(
        req.params.tripId,
        req.user.userId
      );

    return res.json(trip);

  } catch (error: any) {

    console.error(error);

    return res.status(400).json({
      message: error.message
    });

  }

};


// =====================================
// Conductor llegó
// DRIVER_ACCEPTED
//        ↓
// DRIVER_ARRIVED
// =====================================

export const arrivedTrip = async (
  req:any,
  res:any
)=>{

  try{

    const trip =
      await service.arrived(
        req.params.tripId,
        req.user.userId
      );


    return res.json(trip);


  }catch(error:any){

    return res.status(400).json({

      message:error.message

    });

  }

};




// =====================================
// Iniciar viaje
// DRIVER_ARRIVED
//        ↓
// IN_PROGRESS
// =====================================

export const startTrip = async (
  req:any,
  res:any
)=>{

  try{

    const trip =
      await service.start(
        req.params.tripId,
        req.user.userId
      );


    return res.json(trip);


  }catch(error:any){

    return res.status(400).json({

      message:error.message

    });

  }

};




// =====================================
// Finalizar viaje
// IN_PROGRESS
//        ↓
// COMPLETED
// =====================================

export const completeTrip = async (
  req:any,
  res:any
)=>{

  try{

    const trip =
      await service.complete(
        req.params.tripId,
        req.user.userId
      );


    return res.json(trip);


  }catch(error:any){

    return res.status(400).json({

      message:error.message

    });

  }

};




// =====================================
// Cancelar viaje
// =====================================

export const cancelTrip = async (
  req:any,
  res:any
)=>{

  try{

    const { reason } = req.body;


    const trip =
      await service.cancel(
        req.params.tripId,
        req.user.userId,
        reason
      );


    return res.json(trip);


  }catch(error:any){

    return res.status(400).json({

      message:error.message

    });

  }

};


// =====================================
// Rechazar viaje
// DRIVER_ASSIGNED
//        ↓
// PENDING
// =====================================

export const rejectTrip = async (
  req:any,
  res:any
)=>{


  console.log("====== REJECT CONTROLLER ======");
  console.log("tripId:", req.params.tripId);
  console.log("driver:", req.user.userId);


  try{


    const trip =

      await service.reject(

        req.params.tripId,

        req.user.userId

      );


    return res.json(trip);



  }catch(error:any){


    console.error(error);


    return res.status(400).json({

      message:error.message

    });


  }


};