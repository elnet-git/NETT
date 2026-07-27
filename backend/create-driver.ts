import { prisma } from "./src/infrastructure/database/prisma.client";

async function main() {

  const role = await prisma.role.findUnique({
    where:{
      name:"DRIVER"
    }
  });

  if(!role){
    throw new Error("No existe ROLE DRIVER");
  }


  const driver = await prisma.user.create({
    data:{
      name:"Juan",
      email:"juan@nett.com",
      phone:"5555555556",
      passwordHash:"$2b$12$uzbifiTWEPhlAxHvJ3krm.woO.UmKhyTKjmKxNfFohDc3dYChltrK",
      roleId:role.id,

      driverProfile:{
        create:{
          status:"APPROVED"
        }
      }
    }
  });


  console.log(driver);

}


main()
.finally(()=>{
  prisma.$disconnect();
});