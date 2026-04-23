ALTER TABLE "public"."WorkItem"
ADD COLUMN IF NOT EXISTS "assigneeId" UUID;

CREATE INDEX IF NOT EXISTS "WorkItem_assigneeId_idx"
ON "public"."WorkItem" ("assigneeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'WorkItem_assigneeId_fkey'
  ) THEN
    ALTER TABLE "public"."WorkItem"
    ADD CONSTRAINT "WorkItem_assigneeId_fkey"
    FOREIGN KEY ("assigneeId")
    REFERENCES "auth"."users"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;
