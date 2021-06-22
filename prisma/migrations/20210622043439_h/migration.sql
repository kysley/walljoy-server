/*
  Warnings:

  - A unique constraint covering the columns `[u_url]` on the table `Wallpaper` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Wallpaper.u_url_unique" ON "Wallpaper"("u_url");
