-- CreateTable
CREATE TABLE "_CollectionToWallpaper" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToWallpaper_AB_unique" ON "_CollectionToWallpaper"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToWallpaper_B_index" ON "_CollectionToWallpaper"("B");

-- AddForeignKey
ALTER TABLE "_CollectionToWallpaper" ADD FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToWallpaper" ADD FOREIGN KEY ("B") REFERENCES "Wallpaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
