import { NextRequest, NextResponse } from 'next/server'

const hostToPath: Record<string, string> = {
  'in.klaro.services': '/india',
  'ae.klaro.services': '/uae',
  'us.klaro.services': '/us',
  'eu.klaro.services': '/eu',
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0]
  const pathname = req.nextUrl.pathname

  if (pathname === '/' && hostToPath[host]) {
    return NextResponse.redirect(new URL(hostToPath[host], req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
