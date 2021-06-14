/*
  Warnings:

  - Added the required column `deviceId` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "deviceId" TEXT NOT NULL;
