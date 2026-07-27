import { Router } from "express";
import { LocationService } from "./location.service";
import { authGuard } from "../../security/guards/auth.guard";

const router = Router();
const service = new LocationService();

// =====================================
// Actualizar ubicación del conductor
// =====================================

router.post(
  "/update",
  authGuard,
  async (req: any, res: any) => {
    try {
      const driverId = req.user.userId;

      const {
        latitude,
        longitude,
        online,
      } = req.body;

      if (
        latitude === undefined ||
        longitude === undefined
      ) {
        return res.status(400).json({
          message: "Latitude y longitude son obligatorias",
        });
      }

      const result =
        await service.updateDriverLocation(
          driverId,
          {
            latitude: Number(latitude),
            longitude: Number(longitude),
            online: Boolean(online),
          }
        );

      return res.json(result);

    } catch (error: any) {
      console.error("Location update error:", error);

      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

// =====================================
// Buscar conductores cercanos
// =====================================

router.get(
  "/nearby",
  authGuard,
  async (req: any, res: any) => {
    try {
      const {
        latitude,
        longitude,
        radius,
      } = req.query;

      if (
        latitude === undefined ||
        longitude === undefined
      ) {
        return res.status(400).json({
          message: "Latitude y longitude son obligatorias",
        });
      }

      const drivers =
        await service.getNearbyDrivers(
          Number(latitude),
          Number(longitude),
          Number(radius ?? 5)
        );

      return res.json(drivers);

    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

// =====================================
// Obtener ubicación de un conductor
// =====================================

router.get(
  "/:driverId",
  authGuard,
  async (req: any, res: any) => {
    try {
      const driverId = String(req.params.driverId);

      const location =
        await service.getDriverLocation(driverId);

      return res.json(location);

    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

// =====================================
// Conductor offline
// =====================================

router.post(
  "/offline",
  authGuard,
  async (req: any, res: any) => {
    try {
      const driverId = req.user.userId;

      const result =
        await service.setDriverOffline(driverId);

      return res.json(result);

    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

export default router;