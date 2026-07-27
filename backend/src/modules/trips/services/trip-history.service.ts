import { prisma } from "../../../infrastructure/database/prisma.client";

import {
  Prisma,
  TripStatus
} from "../../../generated/prisma/client";

export class TripHistoryService {

  async create(

    tripId: string,

    status: TripStatus,

    description?: string,

    driverId?: string,

    tx: Prisma.TransactionClient = prisma

  ) {

    const history =
      await tx.tripStatusHistory.create({

        data: {

          tripId,

          status,

          description,

          driverId

        }

      });

    return history;

  }

}