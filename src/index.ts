import fastify from "fastify";
import mercurius from "mercurius";
import { makeSchema } from "nexus";
import { nexusPrisma } from "nexus-plugin-prisma";
import path from "path";
import { redis } from "./redis";

import * as types from "./schema";

const schema = makeSchema({
  types,
  plugins: [nexusPrisma()],
  sourceTypes: {
    modules: [
      {
        module: ".prisma/client",
        alias: "PrismaClient",
      },
    ],
  },
  contextType: {
    module: path.join(__dirname, "../types/index.ts"),
    export: "Context",
  },
  outputs: {
    typegen: path.join(
      __dirname,
      "../node_modules/@types/nexus-typegen/index.d.ts"
    ),
    schema: path.join(__dirname, "./api.graphql"),
  },
});

const app = fastify({
  logger: {
    level: "warn",
  },
});

app.get("/health", (_req, res) => {
  res.code(200).send({ statusCode: 200, status: "ok" });
});

app.get("/pin", (req, res) => {
  //@ts-ignore
  if (req.body.secret) {
    //@ts-ignore
    redis.hset("pins", req.body.deviceId, req.body.secret);
    res.code(200).send({ statusCode: 200, status: "ok" });
  }
});

app.register(mercurius, {
  schema,
  context: (request) => request.ctx,
});

app.listen(process.env.PORT || 8080, "0.0.0.0");
