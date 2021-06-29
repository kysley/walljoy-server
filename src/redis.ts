import { ConnectionString } from "connection-string";
import Redis from "ioredis";
import { v4 } from "uuid";

import { decrypt } from "./aes";

export let creds: any = {};

if (process.env.NODE_ENV === "development") {
  creds.password = process.env.REDIS_PASSWORD;
} else if (process.env.NODE_ENV === "production") {
  const redisURL = process.env.FLY_REDIS_CACHE_URL;

  const redisCredentials = new ConnectionString(redisURL);
  creds.host = redisCredentials.hosts![0].name;
  creds.port = redisCredentials.hosts![0].port;
  creds.password = redisCredentials.password;
}

export const redis = new Redis({
  ...creds,
});

const getSessionKey = (sessionId: string) => `sid:${sessionId}`;
const getCollectionKey = (collectionId: number) => `c:${collectionId}`;

export const createSession = async (identity: string) => {
  const sessionId = v4();

  // todo  invalidate session after like 15 mins?
  await redis.set(getSessionKey(sessionId), identity);

  return sessionId;
};

export const getSession = async (sessionId: string) => {
  const encrypted = await redis.get(getSessionKey(sessionId));

  const [deviceId, deviceName] = decrypt(encrypted!).split(",");
  // todo this ! is no good
  return { deviceId, deviceName };
  // return encrypted;
};

export const deleteSession = async (sessionId: string) => {
  await redis.del(getSessionKey(sessionId));
};

export const setCollectionWallpaper = async (
  collectionId: number,
  url: string
) => {
  return await redis.set(getCollectionKey(collectionId), url);
};

export const getCollectionWallpaper = async (collectionId: number) => {
  return await redis.get(getCollectionKey(collectionId));
};
