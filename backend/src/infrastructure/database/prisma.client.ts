import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


class PrismaDatabase {

  private static instance: PrismaClient | null = null;


  static getInstance(): PrismaClient {


    if (!PrismaDatabase.instance) {


      if (!process.env.DATABASE_URL) {

        throw new Error(
          "DATABASE_URL no está configurada"
        );

      }


      const adapter = new PrismaPg({

        connectionString:
          process.env.DATABASE_URL,

      });



      PrismaDatabase.instance =
        new PrismaClient({

          adapter,

          log: [
            "error",
            "warn"
          ]

        });


    }


    return PrismaDatabase.instance;

  }

}


export const prisma =
  PrismaDatabase.getInstance();