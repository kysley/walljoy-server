import { getUnsplashUrl, prisma } from "./utils";

const waitToGetUnsplashUrl = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  return getUnsplashUrl();
};

(async function () {
  try {
    await prisma.account.create({
      data: {
        id: "0",
        email: "walljoy",
      },
    });
  } catch {
    console.info("seed: account exists");
  }

  try {
    await prisma.collection.deleteMany({});
    await prisma.collection.createMany({
      skipDuplicates: true,
      data: [
        {
          name: "Random",
          official: true,
          ownerId: "0",
          // id: 1,
        },
        {
          name: "Structure",
          official: true,
          ownerId: "0",
          // id: 2,
        },
        {
          name: "Earth",
          official: true,
          ownerId: "0",
          // id: 3,
        },
      ],
    });
  } catch {
    console.info("seed: colletions already exist");
  }

  try {
    await prisma.wallpaper.deleteMany({});
    await prisma.$transaction([
      prisma.wallpaper.create({
        data: {
          u_url: await waitToGetUnsplashUrl(),
          collection: {
            connect: {
              id: 1,
            },
          },
        },
      }),
      prisma.wallpaper.create({
        data: {
          u_url: await waitToGetUnsplashUrl(),
          collection: {
            connect: {
              id: 2,
            },
          },
        },
      }),
      prisma.wallpaper.create({
        data: {
          u_url: await waitToGetUnsplashUrl(),
          collection: {
            connect: {
              id: 3,
            },
          },
        },
      }),
    ]);
    // await prisma.wallpaper.createMany({
    //   data: [
    //     {
    //       u_url: await waitToGetUnsplashUrl(),
    //     },
    //     {
    //       u_url: await waitToGetUnsplashUrl(),
    //     },
    //     {
    //       u_url: await waitToGetUnsplashUrl(),
    //     },
    //   ],
    // });
  } catch (e) {
    console.info("seed: wallpaper error", e);
  }
  process.exit(0);
})();
