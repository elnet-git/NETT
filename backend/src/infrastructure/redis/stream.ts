import { redis } from "./client";

const STREAM_KEY = "nett:events";

export const publishEvent = async (type: string, payload: any) => {
  await redis.xadd(
    STREAM_KEY,
    "*",
    "type",
    type,
    "data",
    JSON.stringify(payload)
  );
};

export const consumeEvents = async (group: string, consumer: string) => {
  return redis.xreadgroup(
    "GROUP",
    group,
    consumer,
    "BLOCK",
    0,
    "STREAMS",
    STREAM_KEY,
    ">"
  );
};
