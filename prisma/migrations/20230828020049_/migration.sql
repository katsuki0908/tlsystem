/*
  Warnings:

  - You are about to drop the column `workingtime` on the `shift_system` table. All the data in the column will be lost.
  - Added the required column `working_time` to the `shift_system` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `shift_system` DROP COLUMN `workingtime`,
    ADD COLUMN `working_time` INTEGER NOT NULL,
    MODIFY `day_Monday` VARCHAR(20) NOT NULL;
