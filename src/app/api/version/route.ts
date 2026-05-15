import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '0.1.0',
    name: 'Oswol AI Terminal',
    isDemoMode: true,
    phases: {
      completed: [1, 2, 3, 4, 5, 6],
      total: 6,
    },
    routes: 42,
    stack: {
      framework: 'Next.js 16',
      react: '19',
      typescript: true,
    },
    disclaimer: 'Demo mode — not financial advice.',
  })
}
