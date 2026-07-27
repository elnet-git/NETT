import { prisma } from "../../../infrastructure/database/prisma.client";
import type { Prisma } from "../../../generated/prisma/client";


export class TripRepository {


  private userSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    status: true
  } as const;




  async create(
    data: Prisma.TripCreateInput
  ) {

    return prisma.trip.create({

      data,

      include: {

        passenger: {
          select: this.userSelect
        },

        driver: {
          select: this.userSelect
        }

      }

    });

  }





  async findById(
    id: string
  ) {

    return prisma.trip.findUnique({

      where: {
        id
      },

      include: {

        passenger: {
          select: this.userSelect
        },

        driver: {
          select: this.userSelect
        }

      }

    });

  }





  async update(
    id: string,
    data: Prisma.TripUpdateInput
  ) {

    return prisma.trip.update({

      where: {
        id
      },

      data,

      include: {

        passenger: {
          select: this.userSelect
        },

        driver: {
          select: this.userSelect
        }

      }

    });

  }





  async findAll() {

    return prisma.trip.findMany({

      include: {

        passenger: {
          select: this.userSelect
        },

        driver: {
          select: this.userSelect
        }

      },

      orderBy: {

        createdAt: "desc"

      }

    });

  }





  async findByDriver(
    driverId: string
  ) {

    return prisma.trip.findMany({

      where: {

        driverId

      },

      include: {

        passenger: {
          select: this.userSelect
        },

        driver: {
          select: this.userSelect
        }

      },

      orderBy: {

        createdAt: "desc"

      }

    });

  }





  async findByPassenger(
    passengerId: string
  ) {

    return prisma.trip.findMany({

      where: {

        passengerId

      },

      include: {

        passenger: {
          select: this.userSelect
        },

        driver: {
          select: this.userSelect
        }

      },

      orderBy: {

        createdAt: "desc"

      }

    });

  }


}