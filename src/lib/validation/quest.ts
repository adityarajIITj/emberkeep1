import { z } from "zod";

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "EPIC"] as const;
export const RECURRENCES = ["ONE_TIME", "DAILY", "WEEKLY"] as const;
export const STATUSES = ["ACTIVE", "ARCHIVED"] as const;

export const createQuestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Quest title cannot be empty")
    .max(120, "Quest title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .nullable(),
  categoryId: z.string().uuid("Invalid category ID"),
  difficulty: z.enum(DIFFICULTIES, {
    message: "Difficulty must be EASY, MEDIUM, HARD, or EPIC",
  }),
  recurrence: z.enum(RECURRENCES, {
    message: "Recurrence must be ONE_TIME, DAILY, or WEEKLY",
  }).default("ONE_TIME"),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export const updateQuestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Quest title cannot be empty")
    .max(120, "Quest title must be 120 characters or fewer")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .nullable(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  recurrence: z.enum(RECURRENCES).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export type CreateQuestInput = z.infer<typeof createQuestSchema>;
export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;
