/*
  Warnings:

  - You are about to alter the column `DAY_Monday` on the `shift_system` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `shift_system` MODIFY `DAY_Monday` DATETIME NOT NULL;
