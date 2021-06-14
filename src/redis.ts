import { ConnectionString } from "connection-string";
import Redis from "ioredis";
import { v4 } from "uuid";
import { decrypt } from "./aes";

let creds: any = {};

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

export const createSession = async (identity: string) => {
  const sessionId = v4();

  // todo  invalidate session after like 15 mins?
  await redis.set(getSessionKey(sessionId), identity);

  return sessionId;
};

export const getSesson = async (sessionId: string) => {
  const encrypted = await redis.get(getSessionKey(sessionId));
  // todo this ! is no good
  // return decrypt(encrypted!);
  return encrypted;
};

export const deleteSession = async (sessionId: string) => {
  await redis.del(getSessionKey(sessionId));
};
