import { LocationService } from "./location.service";


const locationService = new LocationService();





export const updateDriverLocation = async (

  req:any,

  res:any

)=>{


  try {



    const driverId = req.user.userId;



    const {

      latitude,

      longitude,

      online

    } = req.body;







    if(

      latitude === undefined ||

      longitude === undefined

    ){

      return res.status(400).json({

        message:
          "Latitude y longitude son obligatorias"

      });

    }







    const result =

      await locationService.updateDriverLocation(

        driverId,

        {

          latitude:Number(latitude),

          longitude:Number(longitude),

          online:Boolean(online)

        }

      );






    return res.json(result);





  }catch(error:any){



    console.error(
      "Update location error:",
      error
    );



    return res.status(500).json({

      message:error.message

    });


  }


};









export const getDriverLocation = async (

  req:any,

  res:any

)=>{


  try {



    const location =

      await locationService.getDriverLocation(

        req.params.driverId

      );




    return res.json(location);





  }catch(error:any){



    return res.status(500).json({

      message:error.message

    });



  }


};









export const setDriverOffline = async (

  req:any,

  res:any

)=>{


  try {



    const result =

      await locationService.setDriverOffline(

        req.user.userId

      );





    return res.json(result);





  }catch(error:any){



    return res.status(500).json({

      message:error.message

    });



  }


};