import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const trips = await prisma.trip.findMany();

  console.log(JSON.stringify(trips, null, 2));
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });