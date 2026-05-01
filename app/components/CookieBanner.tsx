'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('klaro-consent')
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem('klaro-consent', 'accepted')
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem('klaro-consent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0f172a', borderTop: '1px solid #1e293b',
      padding: '16px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
    }}>
      <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, flex: 1, minWidth: '280px' }}>
        We use essential cookies to operate this site. By continuing, you agree to our{' '}
        <Link href="/privacy" style={{ color: '#818cf8', textDecoration: 'underline' }}>Privacy Policy</Link>
        {' '}and{' '}
        <Link href="/cookies" style={{ color: '#818cf8', textDecoration: 'underline' }}>Cookie Policy</Link>.
        {' '}This site complies with GDPR, CCPA, and India DPDP Act 2023.
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button onClick={decline} style={{
          padding: '8px 16px', background: 'transparent', border: '1px solid #334155',
          color: '#64748b', borderRadius: '8px', fontSize: '12px', cursor: 'pointer'
        }}>Decline</button>
        <button onClick={accept} style={{
          padding: '8px 16px', background: '#6366f1', border: 'none',
          color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
        }}>Accept</button>
      </div>
    </div>
  )
}
