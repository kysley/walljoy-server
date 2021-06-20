import Queue from "bull";
import got from "got";
import { URL } from "url";
import { creds, redis } from "./redis";
import { prisma } from "./utils";

const pictureQueue = new Queue("Picture", { redis: { ...creds } });

pictureQueue.process(async (job) => {
  const {
    data: { collection },
  } = job;

  const res = await got("https://source.unsplash.com/random/1920x1080");
  // this is the url for the image
  // default quality is 80%, we want 100%
  const url = new URL(res.url);
  url.searchParams.set("q", "100");

  await redis.set(collection, url.href);
  // await prisma.wallpaper.create({
  //   data: {
  //     u_url: url.href,
  //     collection,
  //   },
  // });
});

pictureQueue.add({ collection: "RANDOM" });
// pictureQueue.add({ collection });
pictureQueue.on("failed", console.log);
