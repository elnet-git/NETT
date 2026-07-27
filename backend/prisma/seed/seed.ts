import "dotenv/config";

import bcrypt from "bcrypt";

import { PrismaClient } from "../../src/generated/prisma/client";
import {
  RoleName,
  DriverStatus,
  VehicleType,
  UserStatus,
} from "../../generated/prisma/enums";

import { PrismaPg } from "@prisma/adapter-pg";


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});


const prisma = new PrismaClient({
  adapter,
});


async function main() {


  // =========================
  // ROLES
  // =========================

  const roles = [
    RoleName.CLIENT,
    RoleName.DRIVER,
    RoleName.STORE,
    RoleName.ADMIN,
  ];


  for (const role of roles) {

    await prisma.role.upsert({

      where:{
        name:role
      },

      update:{},

      create:{
        name:role
      }

    });

  }


  console.log("Roles NETT creados correctamente");



  const clientRole = await prisma.role.findUnique({
    where:{
      name:RoleName.CLIENT
    }
  });


  const driverRole = await prisma.role.findUnique({
    where:{
      name:RoleName.DRIVER
    }
  });


  if(!clientRole || !driverRole){
    throw new Error("Roles no encontrados");
  }



  const passwordHash = await bcrypt.hash(
    "123456",
    12
  );



  // =========================
  // CLIENTE
  // =========================


  const client = await prisma.user.upsert({

    where:{
      email:"cliente@test.com"
    },

    update:{},

    create:{

      name:"Cliente Demo",

      email:"cliente@test.com",

      phone:"7719999999",

      passwordHash,

      status:UserStatus.ACTIVE,

      roleId:clientRole.id

    }

  });


  console.log(
    "Cliente creado:",
    client.id
  );





  // =========================
  // CONDUCTOR 1
  // =========================


  const driver = await prisma.user.upsert({

    where:{
      email:"conductor@test.com"
    },

    update:{},

    create:{

      name:"Conductor Demo",

      email:"conductor@test.com",

      phone:"7718888888",

      passwordHash,

      status:UserStatus.ACTIVE,

      roleId:driverRole.id

    }

  });



  console.log(
    "Conductor creado:",
    driver.id
  );





  // =========================
  // DRIVER PROFILE 1
  // =========================


  const profile = await prisma.driverProfile.upsert({

    where:{
      userId:driver.id
    },

    update:{
      status:DriverStatus.APPROVED
    },

    create:{

      userId:driver.id,

      status:DriverStatus.APPROVED

    }

  });



  console.log(
    "DriverProfile creado:",
    profile.id
  );





  // =========================
  // VEHICULO 1
  // =========================


  await prisma.vehicle.upsert({

    where:{
      plate:"NETT001"
    },

    update:{},

    create:{

      type:VehicleType.MOTORCYCLE,

      brand:"Bajaj",

      model:"RS200",

      year:2025,

      plate:"NETT001",

      color:"Negro",

      driverId:profile.id

    }

  });


  console.log(
    "Vehículo creado"
  );





  // =========================
  // UBICACION 1
  // =========================


  await prisma.driverLocation.upsert({

    where:{
      driverId:driver.id
    },

    update:{

      latitude:20.091,

      longitude:-98.762,

      online:true,

      busy:false

    },

    create:{

      driverId:driver.id,

      latitude:20.091,

      longitude:-98.762,

      online:true,

      busy:false

    }

  });


  console.log(
    "DriverLocation creado"
  );






  // =========================
  // CONDUCTOR 2
  // =========================


  const driver2 = await prisma.user.upsert({

    where:{
      email:"conductor2@test.com"
    },

    update:{},

    create:{

      name:"Conductor Demo 2",

      email:"conductor2@test.com",

      phone:"7718888889",

      passwordHash,

      status:UserStatus.ACTIVE,

      roleId:driverRole.id

    }

  });



  console.log(
    "Conductor 2 creado:",
    driver2.id
  );





  // =========================
  // DRIVER PROFILE 2
  // =========================


  const profile2 = await prisma.driverProfile.upsert({

    where:{
      userId:driver2.id
    },

    update:{
      status:DriverStatus.APPROVED
    },

    create:{

      userId:driver2.id,

      status:DriverStatus.APPROVED

    }

  });



  console.log(
    "DriverProfile 2 creado:",
    profile2.id
  );





  // =========================
  // VEHICULO 2
  // =========================


  await prisma.vehicle.upsert({

    where:{
      plate:"NETT002"
    },

    update:{},

    create:{

      type:VehicleType.MOTORCYCLE,

      brand:"Bajaj",

      model:"Pulsar",

      year:2025,

      plate:"NETT002",

      color:"Rojo",

      driverId:profile2.id

    }

  });



  console.log(
    "Vehículo 2 creado"
  );





  // =========================
  // UBICACION 2
  // =========================


  await prisma.driverLocation.upsert({

    where:{
      driverId:driver2.id
    },

    update:{

      latitude:20.106,

      longitude:-98.721,

      online:true,

      busy:false

    },

    create:{

      driverId:driver2.id,

      latitude:20.106,

      longitude:-98.721,

      online:true,

      busy:false

    }

  });



  console.log(
    "DriverLocation 2 creado"
  );




  console.log(
    "Seed NETT completo"
  );


}



main()

.catch((error)=>{

  console.error(error);

  process.exit(1);

})

.finally(async()=>{

  await prisma.$disconnect();

});