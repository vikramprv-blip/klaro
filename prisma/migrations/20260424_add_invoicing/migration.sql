CREATE TABLE "Invoice" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" TEXT NOT NULL,
  "amount" NUMERIC(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "dueDate" TIMESTAMP,
  "issuedAt" TIMESTAMP DEFAULT now(),
  "paidAt" TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
