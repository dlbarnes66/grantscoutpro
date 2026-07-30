import { z } from "zod";

export const IngestSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().optional(),
  agency: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),

  financial: z.object({
    amount: z.number().nullable().optional(),
    amountMin: z.number().nullable().optional(),
    amountMax: z.number().nullable().optional(),
    totalFunding: z.number().nullable().optional(),
    awardFloor: z.number().nullable().optional(),
    awardCeiling: z.number().nullable().optional(),
    expectedAwards: z.number().nullable().optional(),
  }),

  dates: z.object({
    deadline: z.string().nullable().optional(),
    openDate: z.string().nullable().optional(),
    postedDate: z.string().nullable().optional(),
    updatedDate: z.string().nullable().optional(),
  }),

  sections: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
        order: z.number(),
      })
    )
    .optional(),

  documents: z
    .array(
      z.object({
        filename: z.string(),
        url: z.string(),
      })
    )
    .optional(),

  raw: z.any(),
});

export function validatePayload(payload: any) {
  return IngestSchema.safeParse(payload);
}
