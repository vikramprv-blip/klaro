/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkItemActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `invoiceNo` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `triggeredAt` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `workItemId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Float`.
  - You are about to drop the column `archivedAt` on the `WorkItem` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `WorkItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `WorkItem` table. All the data in the column will be lost.
  - You are about to drop the column `filedAt` on the `WorkItem` table. All the data in the column will be lost.
  - You are about to drop the column `filingType` on the `WorkItem` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceTriggered` on the `WorkItem` table. All the data in the column will be lost.
  - You are about to drop the column `periodLabel` on the `WorkItem` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `WorkItem` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedById` on the `WorkItem` table. All the data in the column will be lost.
  - Added the required column `number` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Made the column `amount` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Client_code_key";

-- DropIndex
DROP INDEX "Notification_userId_read_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "WorkAssignment_userId_workItemId_idx";

-- DropIndex
DROP INDEX "WorkDocument_workItemId_status_idx";

-- DropIndex
DROP INDEX "WorkItemActivity_workItemId_createdAt_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Notification";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkAssignment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkDocument";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkItemActivity";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ServiceTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "department" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'ONCE',
    "dueDayOfMonth" INTEGER,
    "dueMonthOfYear" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME,
    "clientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("amount", "clientId", "createdAt", "id", "status", "updatedAt") SELECT "amount", "clientId", "createdAt", "id", "status", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE TABLE "new_WorkItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" DATETIME,
    "clientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WorkItem" ("clientId", "createdAt", "description", "dueDate", "id", "priority", "status", "title", "updatedAt") SELECT "clientId", "createdAt", "description", "dueDate", "id", coalesce("priority", 'MEDIUM') AS "priority", "status", "title", "updatedAt" FROM "WorkItem";
DROP TABLE "WorkItem";
ALTER TABLE "new_WorkItem" RENAME TO "WorkItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTemplate_code_key" ON "ServiceTemplate"("code");
