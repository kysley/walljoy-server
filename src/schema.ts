import {
  arg,
  inputObjectType,
  list,
  mutationField,
  mutationType,
  nonNull,
  nullable,
  objectType,
  queryField,
  stringArg,
} from "nexus";
import { deleteSession, getSession } from "./redis";

export const Account = objectType({
  name: "Account",
  definition(t) {
    t.model.id();
    t.model.devices();
    t.model.email();
  },
});

export const Collection = objectType({
  name: "Collection",
  definition(t) {
    t.model.name();
    t.model.id();
    t.model.official();
    // t.model.owner()
    t.model.wallpapers();
    t.model.updatedAt();
    t.model.createdAt();
  },
});

export const Wallpaper = objectType({
  name: "Wallpaper",
  definition(t) {
    t.model.collection();
    t.model.id();
    t.model.u_url();
    t.model.createdAt();
    t.model.updatedAt();
  },
});

export const Device = objectType({
  name: "Device",
  definition(t) {
    t.model.id();
    t.model.authorized();
    t.model.code();
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

export const PaginationArgs = inputObjectType({
  name: "PaginationArgs",
  definition(t) {
    t.nonNull.int("take", { default: 15 });
    t.int("cursor");
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
    t.nonNull.string("sessionId");
  },
});

export const Register = mutationField("register", {
  type: "Credentials",
  args: {
    input: nonNull(LoginInput),
  },
  async resolve(_, { input: { email, sessionId } }, ctx) {
    const sessionInfo = await getSession(sessionId);
    console.log(sessionInfo);
    if (sessionInfo) {
      const { deviceId, deviceName } = sessionInfo;

      const acc = await ctx.prisma.account.create({
        include: {
          refreshTokens: true,
        },
        data: {
          email,
          refreshTokens: {
            create: [{ deviceId }],
          },
          devices: {
            create: [
              {
                name: deviceName,
                authorized: true,
                code: "",
                deviceId,
              },
            ],
          },
        },
      });

      // todo  delete session
      await deleteSession(sessionId);
      const token = ctx.createToken({ sub: acc.id, device: deviceId });
      const refreshToken = acc.refreshTokens[0].id;
      return { token, refreshToken };
    }
    return null;
  },
});

export const Signin = mutationField("signin", {
  type: "Account",
  async resolve(_, __, ctx) {
    const claims = ctx.verifyClaims(true); // for testing

    if (!claims) {
      throw new Error("Token Expired.");
      // flag account here for needing pin maybe?
    }

    // if (pin) {
    //   const device = await ctx.prisma.
    // }
    console.log(claims);
    const acc = await ctx.prisma.account.findUnique({
      where: {
        id: claims.sub,
      },
    });

    return acc;
  },
});

export const AuthenticateDevice = mutationField("authenticateDevice", {
  type: "Boolean",
  args: {
    sId: nonNull("String"),
  },
  async resolve(_, { sId }, ctx) {
    const claims = ctx.verifyClaims(true); // testing

    if (!claims) {
      throw new Error("Token expired.");
    }

    const { deviceId, deviceName } = await getSession(sId);

    await ctx.prisma.account.update({
      where: {
        id: claims.sub,
      },
      data: {
        devices: {
          create: {
            deviceId,
            name: deviceName,
            authorized: true,
            code: "",
          },
        },
      },
    });
  },
});

export const Feed = queryField("feed", {
  type: list("Wallpaper"),
  args: {
    where: nullable(PaginationArgs),
  },
  async resolve(_, { where }, ctx) {
    const cursor = where?.cursor
      ? { cursor: { id: where?.cursor }, skip: 1 }
      : undefined;
    console.log(where?.take);
    return ctx.prisma.wallpaper.findMany({
      take: where?.take,
      ...cursor,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        collection: {
          every: {
            official: true,
          },
        },
      },
    });
  },
});

export const Wallpapers = queryField("wallpapers", {
  type: list("Wallpaper"),
  args: {
    where: nullable(PaginationArgs),
  },
  async resolve(_, { where }, ctx) {
    const cursor = where?.cursor
      ? { cursor: { id: where?.cursor }, skip: 1 }
      : undefined;
    return ctx.prisma.wallpaper.findMany({
      take: where?.take,
      ...cursor,
      orderBy: {
        createdAt: "desc",
      },
    });
  },
});

const CollectionQueryWhere = inputObjectType({
  name: "CollectionWhere",
  definition(t) {
    t.string("name");
    t.int("id");
  },
});

export const CollectionQuery = queryField("collection", {
  type: nullable("Collection"),
  args: {
    where: nonNull(CollectionQueryWhere),
  },
  async resolve(_, { where }, ctx) {
    const { name, id } = where;

    if (!name && !id) {
      throw new Error("Please supply either name or id");
    } else if (name && id) {
      throw new Error("Please supply either name or id");
    }

    if (id) {
      return await ctx.prisma.collection.findUnique({
        where: {
          id,
        },
      });
    }

    if (name) {
      return await ctx.prisma.collection.findFirst({
        where: {
          name: {
            contains: name,
          },
        },
      });
    }
    return null;
  },
});

export const WallpaperQuery = queryField("wallpaper", {
  type: nullable("Wallpaper"),
  args: {
    where: nonNull("WallpaperWhereUniqueInput"),
  },
  async resolve(_, { where }, ctx) {
    return await ctx.prisma.wallpaper.findUnique({
      where: {
        id: where?.id,
      },
    });
  },
});
