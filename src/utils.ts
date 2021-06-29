import { FastifyPluginCallback } from "fastify";
import * as jwt from "jsonwebtoken";
import fp from "fastify-plugin";
import { URL } from "url";
import got from "got";

import { PrismaClient } from ".prisma/client";
import { TokenClaims } from "../types";

export const prisma = new PrismaClient({ log: ["query", "info", "warn"] });

export function createToken(claims: TokenClaims) {
  const payload: TokenClaims = {
    exp: Math.floor(Date.now() + 1000 * 60 * 60 * 24), //24hr
    ...claims,
  };

  return jwt.sign(payload, secretToken);
}

const secretToken = process.env.JWT_SECRET || "secret:secret";

const verifyToken = (
  token: string | undefined,
  ignoreExpiration?: boolean
): TokenClaims | null => {
  try {
    return token
      ? (jwt.verify(token.replace(/^Bearer\s+/g, ""), secretToken, {
          ignoreExpiration,
        }) as TokenClaims)
      : null;
  } catch (_error) {
    return null;
  }
};

export const contextPlugin: FastifyPluginCallback = (instance, _, next) => {
  instance.decorate("prisma", prisma);
  instance.decorateRequest("ctx", null);

  instance.addHook("preHandler", (request, _response, done) => {
    let claims: TokenClaims | null | void;

    request.ctx = {
      prisma,
      createToken,
      verifyClaims: (ignore?: boolean) => {
        return claims === undefined
          ? (claims = verifyToken(request.headers["authorization"], ignore))
          : claims;
      },
    };
    done();
  });
  return next();
};

export default fp(contextPlugin);

export const getUnsplashUrl = async (keywords?: string) => {
  let imageUrl = "https://source.unsplash.com/random/1920x1080";

  if (keywords) {
    imageUrl += `?/${keywords}`;
  }

  const res = await got(imageUrl);
  // this is the url for the image
  // default quality is 80%, we want 100%
  const url = new URL(res.url);
  url.searchParams.set("q", "100");

  return url.href;
};

export const waitToGetUnsplashUrl = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  return getUnsplashUrl();
};
