import {
  inputObjectType,
  mutationField,
  mutationType,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from "nexus";
import { decrypt } from "./aes";
import { redis } from "./redis";

export const Account = objectType({
  name: "Account",
  definition(t) {
    t.model.id();
    t.model.devices();
    t.model.email();
  },
});

export const Device = objectType({
  name: "Device",
  definition(t) {
    t.model.id();
    t.model.authorized();
    t.model.pin();
    t.model.account();
    t.model.name();
  },
});

export const Credentials = objectType({
  name: "Credentials",
  definition(t) {
    t.nonNull.string("token");
    t.nonNull.string("refreshToken");
  },
});

export const RefreshCredentials = mutationType({
  definition(t) {
    t.field("refreshCredentials", {
      type: nonNull(Credentials),
      args: {
        refreshToken: nonNull(stringArg()),
      },
      async resolve(_, args, ctx) {
        const claims = ctx.verifyClaims(true);

        const refreshToken = await ctx.prisma.refreshToken.findUnique({
          where: { id: args.refreshToken },
        });

        if (!refreshToken || refreshToken.accountId !== claims?.sub) {
          throw new Error("unauthorized");
        }

        const token = ctx.createToken({
          sub: claims.sub,
          device: claims.device,
        });
        return { token, refreshToken: refreshToken.id };
      },
    });
  },
});

export const LoginInput = inputObjectType({
  name: "LoginInput",
  definition(t) {
    t.nonNull.string("email");
    t.nonNull.string("deviceId");
    t.nonNull.string("deviceName");
  },
});

export const Register = mutationField("register", {
  type: nonNull(Credentials),
  args: {
    input: nonNull(LoginInput),
  },
  async resolve(_, { input: { email, pin, deviceId } }, ctx) {
    const acc = await ctx.prisma.account.create({
      include: {
        refreshTokens: true,
      },
      data: {
        email,
        refreshTokens: {
          create: [{ deviceId }],
        },
      },
    });

    const token = ctx.createToken({ sub: acc.id, device: deviceId });
    const refreshToken = acc.refreshTokens[0].id;
    return { token, refreshToken };
  },
});

export const Signin = mutationField("signin", {
  type: "Account",
  args: {
    pin: "String",
  },
  async resolve(_, { pin }, ctx) {
    const claims = ctx.verifyClaims(true); // for testing

    if (!claims) {
      throw new Error("Token Expired.");
      // flag account here for needing pin maybe?
    }

    // if (pin) {
    //   const device = await ctx.prisma.
    // }
    const acc = await ctx.prisma.account.findUnique({
      where: {
        id: claims.sub,
      },
    });

    return acc;
  },
});

export const DecodePack = queryField("decodePack", {
  type: "Query",
  args: {
    pack: "String",
  },
  async resolve(_, { pack }, ctx) {
    const dataString = decrypt(pack)
    const pieces = 
  },
});

export const AuthenticateDevice = mutationField("authenticateDevice", {
  type: "Boolean",
  args: {
    pin: "String",
    deviceId: "String",
  },
  async resolve(_, { pin, deviceId }, ctx) {
    const expectedPin = redis.hget("pins", deviceId);

    if (pin === expectedPin) {
      return true;
    }
    return false;
  },
});
