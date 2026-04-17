CREATE TABLE "WorkItemActivity" (
  "id" TEXT NOT NULL,
  "workItemId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "meta" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkItemActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkItemActivity_workItemId_createdAt_idx"
ON "WorkItemActivity"("workItemId", "createdAt" DESC);

ALTER TABLE "WorkItemActivity"
ADD CONSTRAINT "WorkItemActivity_workItemId_fkey"
FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
