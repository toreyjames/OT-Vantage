/**
 * OT Radar Client
 *
 * Fetches normalized signals from the OT Radar service (Vercel).
 * Gracefully degrades if Radar is unavailable -- agents continue
 * to work with their existing data sources.
 */

import {
  OTRadarSignal,
  RadarFetchOptions,
  RadarResponse,
} from '../types/ot-radar-signal'

const OT_RADAR_URL = process.env.OT_RADAR_URL || ''
const FETCH_TIMEOUT_MS = 15_000
const MAX_RETRIES = 2

/**
 * Fetch signals from OT Radar with retry and timeout.
 * Returns an empty array if Radar is unreachable or unconfigured.
 */
export async function fetchRadarSignals(
  options: RadarFetchOptions = {}
): Promise<OTRadarSignal[]> {
  if (!OT_RADAR_URL) {
    console.warn('[RadarClient] OT_RADAR_URL not configured -- skipping Radar fetch')
    return []
  }

  const url = buildUrl(options)
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      })
      clearTimeout(timer)

      if (!res.ok) {
        throw new Error(`Radar responded ${res.status}`)
      }

      const body = (await res.json()) as RadarResponse

      if (!body.success || !Array.isArray(body.signals)) {
        console.warn('[RadarClient] Unexpected response shape', body)
        return []
      }

      console.log(
        `[RadarClient] Fetched ${body.signals.length} signals (total: ${body.meta?.total ?? '?'})`
      )
      return body.signals
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < MAX_RETRIES) {
        const backoff = (attempt + 1) * 1000
        await new Promise((r) => setTimeout(r, backoff))
      }
    }
  }

  console.error(
    `[RadarClient] Failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`
  )
  return []
}

function buildUrl(options: RadarFetchOptions): string {
  const base = `${OT_RADAR_URL}/api/signals`
  const params = new URLSearchParams()

  if (options.sector) {
    const sectors = Array.isArray(options.sector) ? options.sector : [options.sector]
    params.set('sector', sectors.join(','))
  }
  if (options.since) {
    params.set('since', options.since)
  }
  if (options.signalType) {
    const types = Array.isArray(options.signalType) ? options.signalType : [options.signalType]
    params.set('signalType', types.join(','))
  }
  if (options.minRelevance !== undefined) {
    params.set('minRelevance', String(options.minRelevance))
  }
  if (options.limit !== undefined) {
    params.set('limit', String(options.limit))
  }

  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

/**
 * Check whether OT Radar is reachable (lightweight health check).
 */
export async function isRadarAvailable(): Promise<boolean> {
  if (!OT_RADAR_URL) return false
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${OT_RADAR_URL}/api/health`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}
