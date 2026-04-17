import { z } from "zod";

const WorkStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "REVIEW", "FILED"]);
const AssignmentRoleEnum = z.enum(["OWNER", "REVIEWER", "SUPPORT"]);
const DocumentStatusEnum = z.enum(["MISSING", "UPLOADED", "VERIFIED"]);

export const createWorkItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  filingType: z.string().min(1),
  periodLabel: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.string().optional(),
  clientId: z.string().min(1),
  createdById: z.string().optional(),
});

export const updateWorkItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  filingType: z.string().min(1).optional(),
  periodLabel: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.string().optional(),
  reviewedById: z.string().optional(),
});

export const updateWorkStatusSchema = z.object({
  status: WorkStatusEnum,
});

export const assignWorkItemSchema = z.object({
  userId: z.string().min(1),
  role: AssignmentRoleEnum.default("OWNER"),
});

export const createDocumentsSchema = z.array(
  z.object({
    name: z.string().min(1),
    docType: z.string().optional(),
  })
);

export const updateDocumentSchema = z.object({
  status: DocumentStatusEnum.optional(),
  fileUrl: z.string().optional(),
  notes: z.string().optional(),
});
