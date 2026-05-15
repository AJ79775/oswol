import { z } from 'zod'

export const ExplainMoveOutputSchema = z.object({
  symbol: z.string(),
  assetName: z.string(),
  summary: z.string(),
  whyMoving: z.array(z.string()).min(1).max(5),
  priceContext: z.object({
    currentPrice: z.number(),
    changePct: z.number(),
    changeAmt: z.number(),
    volumeContext: z.string().optional(),
  }),
  newsContext: z.string(),
  macroContext: z.string(),
  smartMoneyContext: z.string(),
  socialContext: z.string(),
  technicalContext: z.string(),
  whatToWatch: z.array(z.string()).min(1).max(5),
  riskNotes: z.array(z.string()).min(1).max(4),
  confidence: z.enum(['low', 'medium', 'high']),
  sources: z.array(z.object({
    name: z.string(),
    url: z.string().optional(),
    timestamp: z.string().optional(),
    verified: z.boolean().default(false),
  })),
  disclaimer: z.string(),
  isDemoData: z.boolean().default(true),
  generatedAt: z.string(),
})

export type ExplainMoveOutput = z.infer<typeof ExplainMoveOutputSchema>
