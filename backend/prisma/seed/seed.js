"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("../../generated/prisma/client");
const enums_1 = require("../../generated/prisma/enums");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new client_1.PrismaClient({
    adapter,
});
async function main() {
    const roles = [
        enums_1.RoleName.CLIENT,
        enums_1.RoleName.DRIVER,
        enums_1.RoleName.STORE,
        enums_1.RoleName.ADMIN,
    ];
    for (const role of roles) {
        await prisma.role.upsert({
            where: {
                name: role,
            },
            update: {},
            create: {
                name: role,
            },
        });
    }
    console.log("Roles NETT creados correctamente");
}
main()
    .catch((error) => {
    console.error(error);
    throw error;
})
    .finally(async () => {
    await prisma.$disconnect();
});
