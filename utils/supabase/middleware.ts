import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Returns the role-appropriate home path for the given role.
 */
function getHomeForRole(role: string | undefined): string {
  if (role === 'admin' || role === 'staff') return '/admin/dashboard'
  if (role === 'member') return '/member'
  // Fallback for unknown/missing role — treat as member
  return '/member'
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isMemberRoute = pathname.startsWith('/member')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  const role = user?.user_metadata?.role as string | undefined

  // --- Unauthenticated users ---
  if (!user) {
    if (isAdminRoute || isMemberRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // --- Authenticated users on auth pages → redirect to role home ---
  if (isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = getHomeForRole(role)
    return NextResponse.redirect(url)
  }

  // --- Admin routes: only admin or staff ---
  if (isAdminRoute) {
    if (role !== 'admin' && role !== 'staff') {
      const url = request.nextUrl.clone()
      url.pathname = getHomeForRole(role)
      return NextResponse.redirect(url)
    }
  }

  // --- Member routes: only member ---
  if (isMemberRoute) {
    if (role !== 'member') {
      const url = request.nextUrl.clone()
      url.pathname = getHomeForRole(role)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
