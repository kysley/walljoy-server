import { ConnectionString } from "connection-string";
import Redis from "ioredis";

const redisURL = process.env.FLY_REDIS_CACHE_URL;
console.log(process.env);

const redisCredentials = new ConnectionString(redisURL);

export const redis = new Redis({
  host: redisCredentials.hosts![0].name,
  port: redisCredentials.hosts![0].port,
  password: redisCredentials.password,
});
