import { consumeEvents } from "../infrastructure/redis/stream";
import { redis } from "../infrastructure/redis/client";

type StreamData = [
  string,
  [string, string[]][]
][];

export const startMatchingWorker = async () => {
  console.log("🧠 Matching worker running...");

  while (true) {
    const data = await consumeEvents(
      "matching-group",
      "worker-1"
    ) as StreamData | null;

    if (!data || data.length === 0) continue;

    for (const [, messages] of data) {
      for (const [, values] of messages) {
        const type = values[1];
        const payload = JSON.parse(values[3]);

        if (type === "trip.created") {
          await handleTrip(payload);
        }
      }
    }
  }
};

const handleTrip = async (trip: any) => {
  const driversRaw = await redis.keys("driver:location:*");

  if (!driversRaw.length) return;

  const drivers = await Promise.all(
    driversRaw.map(async (key) => {
      const id = key.split(":")[2];
      const loc = await redis.get(key);
      return { id, location: JSON.parse(loc!) };
    })
  );

  const nearest = drivers[0]; // simplificado (se mejora luego)

  await redis.set(`trip:assigned:${trip.id}`, nearest.id);

  console.log("🚗 Driver assigned:", nearest.id);
};