'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Asset {
  canonical_id: string
  name: string
  asset_type: string
  location?: string
  ip_address?: string
  status: string
  sources: string[]
  confidence: number
}

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [assurance, setAssurance] = useState<any>(null)

  useEffect(() => {
    fetchAssets()
    fetchAssurance()
  }, [])

  const fetchAssets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/assets`)
      const data = await response.json()
      setAssets(data.assets || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssurance = async () => {
    try {
      const response = await fetch(`${API_URL}/api/assurance`)
      const data = await response.json()
      setAssurance(data.assurance)
    } catch (error) {
      console.error('Error fetching assurance:', error)
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Assurance Twin
        </h1>
        <p style={{ color: '#666' }}>
          Genesis Assurance Layer - The truth layer that prevents AI from acting on fiction
        </p>
      </header>

      {assurance && (
        <section style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Assurance Judgment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <h3>Readiness</h3>
              <p style={{ fontWeight: 'bold', color: assurance.readiness.status === 'ready' ? 'green' : 'red' }}>
                {assurance.readiness.status.toUpperCase()}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Confidence: {(assurance.readiness.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <h3>Safety</h3>
              <p style={{ fontWeight: 'bold', color: assurance.safety.status === 'safe' ? 'green' : 'red' }}>
                {assurance.safety.status.toUpperCase()}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Confidence: {(assurance.safety.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Canonical Assets</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {assets.map((asset) => (
              <div
                key={asset.canonical_id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{asset.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                      Type: {asset.asset_type} | Status: {asset.status}
                    </p>
                    {asset.ip_address && (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                        IP: {asset.ip_address}
                      </p>
                    )}
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                      Sources: {asset.sources.join(', ')} | Confidence: {(asset.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && assets.length === 0 && (
          <p style={{ color: '#666' }}>
            No assets found. Upload data sources to begin canonization.
          </p>
        )}
      </section>
    </main>
  )
}



