import fastify from "fastify";
import mercurius from "mercurius";
import { makeSchema } from "nexus";
import { nexusPrisma } from "nexus-plugin-prisma";
import path from "path";
import fcors from "fastify-cors";

import { createSession, getCollectionWallpaper } from "./redis";
import context, { prisma } from "./utils";
import * as types from "./schema";
import { encrypt } from "./aes";
import "./queue";

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
  console.log("ack");
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

app.get("/c/:id", async (req, res) => {
  const cId = req.params.id;
  console.log(cId);

  return await getCollectionWallpaper(cId);
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

app.register(fcors);

app.register(mercurius, {
  schema,
  context: (request) => request.ctx,
  graphiql: true,
});

app.listen(process.env.PORT || 8080, "0.0.0.0");

// hit https://source.unsplash.com/random/1920x1080 for 1920x1080 url
// rewrite response to set q=100
// perhaps snag the photo id as well
// have a redis job that will get the days wallpaper at midnight. This means that we will
// probably have the client request the new wallpaper slightly after midnight (race condition)
