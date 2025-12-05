import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check for maintenance mode environment variable
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

    // Paths that should always be accessible
    const publicPaths = [
        '/_next',
        '/static',
        '/favicon.ico',
        '/maintenance',
        '/san-ramon-hills.jpg' // Allow hero image
    ]

    const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (isMaintenanceMode && !isPublicPath) {
        return NextResponse.redirect(new URL('/maintenance', request.url))
    }

    // If we are NOT in maintenance mode, but user tries to access /maintenance, redirect to home
    if (!isMaintenanceMode && request.nextUrl.pathname === '/maintenance') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
