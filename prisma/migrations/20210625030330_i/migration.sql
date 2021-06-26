/*
  Warnings:

  - You are about to drop the column `collectionId` on the `Wallpaper` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Wallpaper" DROP CONSTRAINT "Wallpaper_collectionId_fkey";

-- AlterTable
ALTER TABLE "Wallpaper" DROP COLUMN "collectionId";
