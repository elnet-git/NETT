import "dotenv/config";

import { prisma } from "./src/infrastructure/database/prisma.client";


async function main(){

  const database = await prisma.$queryRaw`
    SELECT current_database(), current_schema();
  `;

  console.log("DATABASE:");
  console.log(database);


  const tables = await prisma.$queryRaw`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;


  console.log("TABLES:");
  console.log(tables);


  await prisma.$disconnect();

}


main();