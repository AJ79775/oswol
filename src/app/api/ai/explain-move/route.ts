import { NextRequest, NextResponse } from 'next/server'
import { explainMove } from '@/lib/agents/marketExplainer'
import { ExplainMoveOutputSchema } from '@/lib/validators/explainMoveSchema'
import { z } from 'zod'

const RequestSchema = z.object({
  symbol: z.string().min(1).max(20),
  changePct: z.number().optional().default(0),
  timeframe: z.string().optional().default('1D'),
  userContext: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = RequestSchema.parse(body)

    const result = await explainMove(parsed.symbol, parsed.changePct)

    // Validate output
    const validated = ExplainMoveOutputSchema.parse(result)

    return NextResponse.json(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 })
    }
    console.error('Explain move error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
