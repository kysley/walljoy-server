import fastify from "fastify";
import mercurius from "mercurius";
import { makeSchema } from "nexus";
import { nexusPrisma } from "nexus-plugin-prisma";
import path from "path";

import { createSession } from "./redis";
import context, { prisma } from "./utils";

import * as types from "./schema";
import { encrypt } from "./aes";

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

// the device owning the id will call this to get a sessionId to open the web app with
app.post("/ack", async (req, res) => {
  if (req.body.identity) {
    // todo  this should be encrypted from the client
    const [deviceId, deviceName, code] = req.body.identity;
    const sessionId = await createSession(encrypt(req.body.identity));
    if (code) {
      const newCode = Math.random().toString(36).slice(2);
      return {
        newCode,
        sessionId,
      };
    }

    return sessionId;
  }
});

// there also needs to be an endpoint to get a code. this would be called if ??
app.post("/renew", async (req, res) => {
  // verify the device somehow
  if (req.body.identity) {
    const newCode = Math.random().toString(36).slice(2);
    return newCode;
  }
});

app.register(context);

app.register(mercurius, {
  schema,
  context: (request) => request.ctx,
});

app.listen(process.env.PORT || 8080, "0.0.0.0");
