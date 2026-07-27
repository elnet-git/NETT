import "dotenv/config";
import { prisma } from "./src/infrastructure/database/prisma.client";

async function main(){

  const drivers = await prisma.user.findMany({
    where:{
      role:{
        name:"DRIVER"
      }
    },
    select:{
      id:true,
      name:true,
      email:true,
      role:true,
      driverProfile:true
    }
  });

  console.log(JSON.stringify(drivers,null,2));

}

main()
.finally(()=>{
  prisma.$disconnect();
});