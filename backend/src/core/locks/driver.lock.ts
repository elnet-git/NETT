import { redis } from "../../infrastructure/redis/client";


const LOCK_TIME_SECONDS = 30;



export async function acquireDriverLock(
  driverId:string
):Promise<boolean>{


  const key =
    `driver:lock:${driverId}`;



  const result = await redis.set(
    key,
    "LOCKED",
    "EX",
    LOCK_TIME_SECONDS,
    "NX"
  );



  return result === "OK";

}




export async function releaseDriverLock(
  driverId:string
):Promise<void>{


  const key =
    `driver:lock:${driverId}`;



  await redis.del(key);


}