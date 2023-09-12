/*
  Warnings:

  - You are about to drop the column `day_Monday` on the `shift_system` table. All the data in the column will be lost.
  - Added the required column `DAY_Monday` to the `shift_system` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `shift_system` DROP COLUMN `day_Monday`,
    ADD COLUMN `DAY_Monday` VARCHAR(20) NOT NULL;
