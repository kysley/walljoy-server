import { getUnsplashUrl, prisma } from "./utils";

const waitToGetUnsplashUrl = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  return getUnsplashUrl();
};

(async function () {
  try {
  } catch {
    console.info("seed: account exists");
    await prisma.account.create({
      data: {
        id: "0",
        email: "walljoy",
      },
    });
  }

  try {
    await prisma.collection.createMany({
      data: [
        {
          name: "Random",
          official: true,
          ownerId: "0",
          id: 1,
        },
        {
          name: "Structure",
          official: true,
          ownerId: "0",
          id: 2,
        },
        {
          name: "Earth",
          official: true,
          ownerId: "0",
          id: 3,
        },
      ],
    });
  } catch {
    console.info("seed: colletions already exist");
  }

  try {
    await prisma.wallpaper.createMany({
      data: [
        {
          u_url: await waitToGetUnsplashUrl(),
          collectionId: 1,
        },
        {
          u_url: await waitToGetUnsplashUrl(),
          collectionId: 2,
        },
        {
          u_url: await waitToGetUnsplashUrl(),
          collectionId: 3,
        },
      ],
    });
  } catch {
    console.info("seed: wallpaper error");
  }
  process.exit(0);
})();
