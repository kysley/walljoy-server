/*
  Warnings:

  - You are about to drop the column `author` on the `Wallpaper` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Wallpaper` table. All the data in the column will be lost.
  - You are about to drop the column `u_id` on the `Wallpaper` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Wallpaper" DROP COLUMN "author",
DROP COLUMN "link",
DROP COLUMN "u_id";
