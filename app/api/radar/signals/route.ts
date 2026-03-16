import { NextResponse } from 'next/server'
import { fetchRadarSignals, isRadarAvailable } from '@/lib/services/radar-client'
import type { RadarFetchOptions, RadarSector, RadarSignalType } from '@/lib/types/ot-radar-signal'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const options: RadarFetchOptions = {}
  if (searchParams.get('sector')) {
    options.sector = searchParams.get('sector')!.split(',') as RadarSector[]
  }
  if (searchParams.get('since')) {
    options.since = searchParams.get('since')!
  }
  if (searchParams.get('signalType')) {
    options.signalType = searchParams.get('signalType')!.split(',') as RadarSignalType[]
  }
  if (searchParams.get('minRelevance')) {
    options.minRelevance = Number(searchParams.get('minRelevance'))
  }
  if (searchParams.get('limit')) {
    options.limit = Number(searchParams.get('limit'))
  }

  try {
    const [signals, available] = await Promise.all([
      fetchRadarSignals(options),
      isRadarAvailable(),
    ])

    return NextResponse.json({
      success: true,
      signals,
      radarStatus: available ? 'connected' : 'unavailable',
      meta: {
        count: signals.length,
        timestamp: new Date().toISOString(),
        source: 'ot-radar',
      },
    })
  } catch (error) {
    console.error('[/api/radar/signals] Error:', error)
    return NextResponse.json(
      {
        success: false,
        signals: [],
        radarStatus: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    )
  }
}
