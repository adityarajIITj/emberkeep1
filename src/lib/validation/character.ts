import { z } from "zod";

export const characterInitSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Adventurer display name is required")
    .max(40, "Display name must be 40 characters or fewer"),
  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required")
    .default("UTC"),
});

export type CharacterInitInput = z.infer<typeof characterInitSchema>;
