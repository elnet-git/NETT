import { on } from "../../core/event-bus";

on("trip.created", (trip) => {
  console.log("🚖 Matching iniciado:", trip.id);
});