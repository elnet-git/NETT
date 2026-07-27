import {
  emitToTrip
} from "../../realtime/socket";
import {
 TripStatus
} from "../../generated/prisma/client";

import { prisma } from "../../infrastructure/database/prisma.client";
import { redis } from "../../infrastructure/redis/client";
import { publishEvent } from "../../infrastructure/redis/stream";

interface DriverLocationInput {
  latitude: number;
  longitude: number;
  online: boolean;
}

interface NearbyDriver {
  id: string;
  driverId: string;
  latitude: number;
  longitude: number;
  online: boolean;
  distance: number;
  driver: any;
}

export class LocationService {

  async updateDriverLocation(
    driverId: string,
    location: DriverLocationInput
  ) {

    if (
      location.latitude < -90 ||
      location.latitude > 90 ||
      location.longitude < -180 ||
      location.longitude > 180
    ) {
      throw new Error("Coordenadas inválidas");
    }

    const data = {
      driverId,
      latitude: location.latitude,
      longitude: location.longitude,
      online: location.online,
      updatedAt: Date.now()
    };

    try {

      // ==========================
      // REDIS
      // ==========================

      await redis.set(
        `driver:location:${driverId}`,
        JSON.stringify(data),
        "EX",
        300
      );

      await redis.geoadd(
        "drivers:geo",
        location.longitude,
        location.latitude,
        driverId
      );

      // ==========================
      // POSTGRESQL
      // ==========================

      await prisma.driverLocation.upsert({

        where: {
          driverId
        },

        update: {
          latitude: location.latitude,
          longitude: location.longitude,
          online: location.online
        },

        create: {
          driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          online: location.online
        }

      });

      const activeTrip = await prisma.trip.findFirst({
  where: {
    driverId,
    status:{
 in:[
   TripStatus.DRIVER_ACCEPTED,
   TripStatus.DRIVER_ARRIVED,
   TripStatus.IN_PROGRESS
 ]
}
  }
});

console.log("ACTIVE TRIP:", activeTrip);

if (activeTrip) {

  console.log("EMITIENDO UBICACION:", activeTrip.id);


  emitToTrip(
    activeTrip.id,
    "trip:location",
    {
      tripId: activeTrip.id,
      driverId,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: Date.now()
    }
  );

  console.log("EMIT TERMINADO");

}
      // ==========================
      // EVENTO
      // ==========================

      await publishEvent(
        "driver.location",
        {
          driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          online: location.online,
          timestamp: Date.now()
        }
      );

// ==========================
// SOCKET TRACKING
// ==========================

      return {
        success: true,
        driverId
      };

    } catch (error) {

      console.error(
        "Location update error:",
        error
      );

      throw error;

    }

  }

  async getDriverLocation(
    driverId: string
  ) {

    const cache = await redis.get(
      `driver:location:${driverId}`
    );

    if (cache) {
      return JSON.parse(cache);
    }

    return prisma.driverLocation.findUnique({

      where: {
        driverId
      }

    });

  }
    async setDriverOffline(
    driverId: string
  ) {

    await prisma.driverLocation.upsert({

      where: {
        driverId
      },

      update: {
        online: false
      },

      create: {
        driverId,
        latitude: 0,
        longitude: 0,
        online: false
      }

    });

    await redis.del(
      `driver:location:${driverId}`
    );

    await redis.zrem(
      "drivers:geo",
      driverId
    );

    await publishEvent(
      "driver.offline",
      {
        driverId,
        timestamp: Date.now()
      }
    );

    return {
      success: true
    };

  }

  async getOnlineDrivers() {

    return prisma.driverLocation.findMany({

      where: {
        online: true
      },

      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }

    });

  }

  async getNearbyDrivers(

    latitude: number,

    longitude: number,

    radiusKm: number = 5

  ): Promise<NearbyDriver[]> {

    const drivers = await prisma.driverLocation.findMany({

      where: {
        online: true
      },

      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }

    });

    return drivers

      .map(driver => {

        const distance = this.calculateDistance(

          latitude,

          longitude,

          driver.latitude,

          driver.longitude

        );

        return {

          ...driver,

          distance

        };

      })

      .filter(driver =>

        driver.distance <= radiusKm

      )

      .sort((a, b) =>

        a.distance - b.distance

      );

  }

  private calculateDistance(

    lat1: number,

    lon1: number,

    lat2: number,

    lon2: number

  ) {

    const R = 6371;

    const dLat = this.toRadians(

      lat2 - lat1

    );

    const dLon = this.toRadians(

      lon2 - lon1

    );

    const a =

      Math.sin(dLat / 2) ** 2 +

      Math.cos(this.toRadians(lat1)) *

      Math.cos(this.toRadians(lat2)) *

      Math.sin(dLon / 2) ** 2;

    const c =

      2 *

      Math.atan2(

        Math.sqrt(a),

        Math.sqrt(1 - a)

      );

    return R * c;

  }

  private toRadians(

    degrees: number

  ) {

    return degrees *

      Math.PI /

      180;

  }

}