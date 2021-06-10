import { PrismaClient } from ".prisma/client";

export interface TokenClaims {
  exp?: number;
  sub: string;
  device: string;
}

export type Context = {
  prisma: PrismaClient;
  createToken(claims: TokenClaims): string;
  verifyClaims(ignoreExpiration?: boolean): TokenClaims | null;
};

declare module "fastify" {
  interface FastifyRequest {
    ctx: Context;
  }
}
