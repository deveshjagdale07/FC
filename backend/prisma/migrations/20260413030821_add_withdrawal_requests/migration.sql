-- CreateTable
CREATE TABLE `withdrawal_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farmerId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` ENUM('BANK', 'UPI') NOT NULL,
    `bankName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,
    `upiId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_farmerId_fkey` FOREIGN KEY (`farmerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
