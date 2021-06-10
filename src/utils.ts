import { FastifyPluginCallback } from "fastify";
import * as jwt from "jsonwebtoken";
import fp from "fastify-plugin";

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

const secretToken = process.env.JWT_SECRET || "secret:trygql.dev";

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
