/*
  Warnings:

  - Added the required column `collectionId` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "activeCollectionId" INTEGER,
ADD COLUMN     "collectionId" INTEGER NOT NULL;
