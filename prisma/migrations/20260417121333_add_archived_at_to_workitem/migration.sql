-- AlterTable
ALTER TABLE "WorkItem" ADD COLUMN "archivedAt" DATETIME;

-- CreateIndex
CREATE INDEX "WorkItem_status_position_idx" ON "WorkItem"("status", "position");
