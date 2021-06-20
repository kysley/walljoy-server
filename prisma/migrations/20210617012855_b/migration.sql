-- CreateEnum
CREATE TYPE "Collection" AS ENUM ('EARTH', 'STRUCTURE', 'RANDOM');

-- CreateTable
CREATE TABLE "Wallpaper" (
    "id" TEXT NOT NULL,
    "collection" "Collection" NOT NULL,
    "link" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "u_url" TEXT NOT NULL,
    "u_id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);
