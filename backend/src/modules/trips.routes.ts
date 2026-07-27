import express from "express";


import {
  createTrip,
  getTrips,
  getDriverTrips,
  getTripById,
  getActiveTrip
} from "./trips/controllers/trips.controller";

import {
  updateLocation,
  getLastLocation,
  getLocationHistory
} from "./trips/controllers/trip-tracking.controller";

import {
  acceptTrip,
  rejectTrip,
  arrivedTrip,
  startTrip,
  completeTrip,
  cancelTrip
} from "./trips/controllers/trip-state.controller";


import { authGuard } from "../security/guards/auth.guard";


const router = express.Router();





// =====================================
// Crear viaje
//
// POST /trips
//
// PENDING
//      ↓
// MATCHING
//      ↓
// DRIVER_ASSIGNED
// =====================================

router.post(
  "/",
  authGuard,
  createTrip
);








// =====================================
// Obtener todos los viajes
// GET /trips
// =====================================

router.get(
  "/",
  authGuard,
  getTrips
);



// =====================================
// Viajes del conductor autenticado
// GET /trips/my-driver
// =====================================

router.get(
  "/my-driver",
  authGuard,
  getDriverTrips
);


// =====================================
// Obtener viaje activo del cliente
// GET /trips/active
// =====================================

router.get(
  "/active",
  authGuard,
  getActiveTrip
);


// =====================================
// Obtener viaje por ID
// GET /trips/:tripId
// =====================================

router.get(
  "/:tripId",
  authGuard,
  getTripById
);


// =====================================
// Rechazar viaje
//
// DRIVER_ASSIGNED
//        ↓
// PENDING
//
// POST /trips/:tripId/reject
// =====================================

router.post(
 "/:tripId/reject",
 authGuard,
 rejectTrip
);








// =====================================
// Aceptar viaje
//
// DRIVER_ASSIGNED
//        ↓
// DRIVER_ACCEPTED
//
// POST /trips/:tripId/accept
// =====================================

router.post(
  "/:tripId/accept",
  authGuard,
  acceptTrip
);








// =====================================
// Conductor llegó
//
// DRIVER_ACCEPTED
//        ↓
// DRIVER_ARRIVED
//
// POST /trips/:tripId/arrived
// =====================================

router.post(
  "/:tripId/arrived",
  authGuard,
  arrivedTrip
);








// =====================================
// Iniciar viaje
//
// DRIVER_ARRIVED
//        ↓
// IN_PROGRESS
//
// POST /trips/:tripId/start
// =====================================

router.post(
  "/:tripId/start",
  authGuard,
  startTrip
);








// =====================================
// Completar viaje
//
// IN_PROGRESS
//        ↓
// COMPLETED
//
// POST /trips/:tripId/complete
// =====================================

router.post(
  "/:tripId/complete",
  authGuard,
  completeTrip
);








// =====================================
// Cancelar viaje
//
// PENDING
// MATCHING
// DRIVER_ASSIGNED
// DRIVER_ACCEPTED
// DRIVER_ARRIVED
// EXPIRED
//
// POST /trips/:tripId/cancel
// =====================================

router.post(
  "/:tripId/cancel",
  authGuard,
  cancelTrip
);








// =====================================
// Actualizar ubicación conductor
//
// POST /trips/:tripId/location
// =====================================

router.post(
  "/:tripId/location",
  authGuard,
  updateLocation
);








// =====================================
// Última ubicación del viaje
//
// GET /trips/:tripId/location
// =====================================

router.get(
  "/:tripId/location",
  authGuard,
  getLastLocation
);


// =====================================
// Historial de ubicaciones del viaje
//
// GET /trips/:tripId/location/history
// =====================================

router.get(
  "/:tripId/location/history",
  authGuard,
  getLocationHistory
);







export default router;