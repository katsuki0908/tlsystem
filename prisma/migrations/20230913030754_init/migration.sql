-- AlterTable
ALTER TABLE `shift_system` MODIFY `job_type` VARCHAR(191) NOT NULL,
    MODIFY `user_name` VARCHAR(191) NOT NULL,
    MODIFY `DAY_Monday` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
