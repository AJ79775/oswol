import { NextResponse } from 'next/server'
import { mockNarratives } from '@/lib/data/mockSocialData'

export async function GET() {
  return NextResponse.json({
    isDemoData: true,
    narratives: mockNarratives,
    count: mockNarratives.length,
  })
}
