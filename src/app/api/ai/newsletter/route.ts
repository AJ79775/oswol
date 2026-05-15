import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const RequestSchema = z.object({
  type: z.string().optional().default('daily'),
  tone: z.enum(['professional', 'sharp', 'educational']).optional().default('professional'),
  language: z.enum(['en', 'ar', 'bilingual']).optional().default('en'),
  sections: z.array(z.string()).optional(),
  symbols: z.array(z.string()).optional(),
  date: z.string().optional(),
})

const CONTENT: Record<string, Record<string, string>> = {
  headline: {
    professional: 'Markets Stage Tech-Led Rally as AI Capex Momentum Persists',
    sharp: 'NVDA rips 4% — AI power trade back on. Here\'s what you missed.',
    educational: 'Understanding Today\'s Tech Rally: Why AI Infrastructure Spending Drives Semis',
  },
  summary: {
    professional:
      'Equity markets traded higher Thursday, led by semiconductor names after NVIDIA\'s Q1 earnings beat reaffirmed the durability of AI infrastructure spending. The Nasdaq-100 outperformed with a 1.12% gain. Rate-sensitive sectors lagged as yields remained elevated ahead of Friday\'s PCE print.',
    sharp:
      'NVDA crushed Q1 estimates. Again. +4.21% on the day. AMD followed at +4.27%. The AI power trade is alive and eating rate fears for breakfast. TSLA underperforms — delivery concerns persist. Fed cut expectations cooling on strong jobs data.',
    educational:
      'Today\'s market action offers a case study in earnings surprise dynamics. When a bellwether like NVIDIA reports above expectations, it signals confidence in the broader AI investment cycle, creating positive spillover effects for adjacent names like AMD and Broadcom.',
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const params = RequestSchema.parse(body)
    const { tone, language } = params

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const sections = [
      {
        id: 'overview',
        title: 'Market Overview',
        content:
          'SPY +0.68% · QQQ +1.12% · IWM −0.42% · VIX 13.42 (−4.82%)\nMarket regime: RISK-ON. Tech leading. Defensives lagging. Rates holding elevated.',
        regime: 'RISK-ON',
      },
      {
        id: 'movers',
        title: 'Top Movers',
        content:
          'Gainers: NVDA +4.21%, AMD +4.27%, META +1.84%, SOL +3.82%\nLosers: TSLA −2.36%, INTC −1.82%, XOM −0.88%',
      },
      {
        id: 'smart-money',
        title: 'Smart Money',
        content:
          '7 Congressional NVDA purchases in last 30 days. Lisa Su (AMD CEO) bought open market. No major insider exits flagged.',
        warning: 'STOCK Act filings carry 30–45 day delay — these transactions may not reflect current positions.',
      },
      {
        id: 'social',
        title: 'Social Narratives',
        content:
          'AI Power Demand narrative at peak velocity (94/100, 48.2k mentions). BTC ETF inflows story gaining traction. EV demand slowdown trending bearish. Fed rate cut timeline being repriced.',
        warning: 'Social sentiment may be noisy, manipulated, or incomplete.',
      },
      {
        id: 'macro',
        title: 'Macro Watch',
        content:
          'PCE Price Index due Friday — consensus 2.6% YoY. Fed rhetoric remains hawkish. 10Y yield at 4.28%. DXY 104.12.',
      },
      {
        id: 'watchlist',
        title: 'Watchlist Movers',
        content:
          'Your tracked names: NVDA +4.21% (outperform), AMD +4.27% (outperform), META +1.84% (in line), MSFT +0.80% (in line), BTC +2.48% (momentum).',
      },
    ]

    const activeSections = params.sections
      ? sections.filter(s => params.sections!.includes(s.id))
      : sections

    const markdownParts = [
      `# ${CONTENT.headline[tone]}`,
      `*${today}*`,
      '',
      CONTENT.summary[tone],
      '',
      ...activeSections.map(s => [
        `## ${s.title}`,
        s.content,
        s.warning ? `> ⚠️ ${s.warning}` : '',
        '',
      ].filter(Boolean).join('\n')),
    ]

    const markdown = markdownParts.join('\n')

    const wordCount = markdown.split(/\s+/).length
    const readingTimeMinutes = Math.ceil(wordCount / 200)

    return NextResponse.json({
      title: CONTENT.headline[tone],
      summary: CONTENT.summary[tone],
      date: today,
      tone,
      language,
      sections: activeSections,
      markdown,
      html: `<article>${markdown.replace(/\n/g, '<br/>')}</article>`,
      disclaimer:
        'This newsletter is for informational purposes only and does not constitute financial advice. All data is demo/simulated. Past performance does not indicate future results.',
      isDemoData: true,
      readingTimeMinutes,
      wordCount,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 })
    }
    console.error('Newsletter generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
