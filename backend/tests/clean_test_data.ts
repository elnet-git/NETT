
import "dotenv/config";
import { prisma } from "../src/infrastructure/database/prisma.client";


async function clean(){

  console.log("========== LIMPIANDO PRUEBAS ==========");


  // =====================================
  // Borrar historial de estados
  // =====================================

  await prisma.tripStatusHistory.deleteMany({});



  // =====================================
  // Borrar viajes
  // =====================================

  await prisma.trip.deleteMany({});



  // =====================================
  // Liberar conductores
  // =====================================

  await prisma.driverLocation.updateMany({

    data:{
      busy:false
    }

  });



  console.log("✅ DATOS DE PRUEBA LIMPIOS");


}



clean()

.then(()=>{

  console.log("FIN");

  process.exit(0);

})

.catch(error=>{

  console.error(error);

  process.exit(1);

});