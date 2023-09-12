-- CreateTable
CREATE TABLE `shift_system` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `job_type` VARCHAR(20) NOT NULL,
    `user_name` VARCHAR(20) NOT NULL,
    `start_time` INTEGER NOT NULL,
    `line_number` INTEGER NOT NULL,
    `day_Monday` DATETIME NOT NULL,
    `workingtime` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
