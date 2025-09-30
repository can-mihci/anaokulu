import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/teacher') ||
    request.nextUrl.pathname.startsWith('/parent')

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to appropriate dashboard if already logged in and visiting login page
  if (request.nextUrl.pathname === '/login' && user) {
    // Check user role and redirect accordingly
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()
    
    if (admin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()
    
    if (teacher) {
      return NextResponse.redirect(new URL('/teacher', request.url))
    }

    const { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()
    
    if (parent) {
      return NextResponse.redirect(new URL('/parent', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}