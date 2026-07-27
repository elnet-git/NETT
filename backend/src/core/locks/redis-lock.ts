import crypto from "crypto";
import { redis } from "../../infrastructure/redis/client";

const LOCK_TTL = 10000;

// Guardamos el token del lock adquirido
const ownedLocks = new Map<string, string>();

// =====================================================
// ADQUIRIR LOCK
// =====================================================

export async function acquireLock(
  key: string
): Promise<boolean> {

  const token = crypto.randomUUID();

  const result = await redis.set(

    `lock:${key}`,

    token,

    "PX",

    LOCK_TTL,

    "NX"

  );

  if (result !== "OK") {

    return false;

  }

  ownedLocks.set(key, token);

  return true;

}

// =====================================================
// LIBERAR LOCK
// =====================================================

const releaseScript = `

if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
else
    return 0
end

`;

export async function releaseLock(
  key: string
): Promise<void> {

  const token = ownedLocks.get(key);

  if (!token) {

    return;

  }

  await redis.eval(

    releaseScript,

    1,

    `lock:${key}`,

    token

  );

  ownedLocks.delete(key);

}

// =====================================================
// DRIVER LOCK
// =====================================================

export async function acquireDriverLock(
  driverId: string
): Promise<boolean> {

  return acquireLock(`driver:${driverId}`);

}

export async function releaseDriverLock(
  driverId: string
): Promise<void> {

  await releaseLock(`driver:${driverId}`);

}

// =====================================================
// TRIP LOCK
// =====================================================

export async function acquireTripLock(
  tripId: string
): Promise<boolean> {

  return acquireLock(`trip:${tripId}`);

}

export async function releaseTripLock(
  tripId: string
): Promise<void> {

  await releaseLock(`trip:${tripId}`);

}