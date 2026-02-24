import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = [ '/', '/projects', '/settings']
const publicRoutes = ['/login', '/signup']

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)
    const isPublicRoute = publicRoutes.includes(path)
    const supabase = await createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (isProtectedRoute && !user) {
            console.log("meow")
            return NextResponse.redirect(new URL('/login', req.url))
        }
        return NextResponse.next()

    } catch (error) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }


}

// Routes Proxy should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}