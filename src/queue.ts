import Queue from "bull";

import { creds, setCollectionWallpaper } from "./redis";
import { prisma, waitToGetUnsplashUrl } from "./utils";

const pictureQueue = new Queue("Picture", { redis: { ...creds } });

pictureQueue.process(async (job) => {
  const {
    data: { collectionId },
  } = job;

  const url = await waitToGetUnsplashUrl();

  await setCollectionWallpaper(collectionId, url);
  await prisma.wallpaper.create({
    data: {
      u_url: url,
      collection: {
        connect: {
          id: collectionId,
        },
      },
    },
  });
});

// pictureQueue.add({ collectionId: Math.floor(Math.random() * 3 + 1) });
// pictureQueue.add({ collectionId: Math.floor(Math.random() * 3 + 1) });
// pictureQueue.add({ collectionId: Math.floor(Math.random() * 3 + 1) });
// pictureQueue.add({ collectionId: 1 });
// pictureQueue.add({ collectionId: 2 });
// pictureQueue.add({ collectionId: 3 });
pictureQueue.on("failed", console.log);
