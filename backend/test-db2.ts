import "dotenv/config";
import { prisma } from "./src/infrastructure/database/prisma.client";


async function main(){

  const db = await prisma.$queryRawUnsafe(`
    SELECT 
      current_database(),
      current_schema(),
      inet_server_addr(),
      inet_server_port()
  `);

  console.log("CONEXION PRISMA:");
  console.log(db);


  const tables = await prisma.$queryRawUnsafe(`
    SELECT schemaname, tablename
    FROM pg_tables
    ORDER BY schemaname, tablename;
  `);


  console.log("TABLAS:");
  console.log(tables);


}


main()
.then(async()=>{
 await prisma.$disconnect();
})
.catch(async(e)=>{
 console.error(e);
 await prisma.$disconnect();
});