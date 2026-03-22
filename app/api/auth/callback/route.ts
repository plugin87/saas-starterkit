import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Redirect based on user role after OAuth login
    const role = data?.user?.user_metadata?.role as string | undefined
    if (role === 'admin' || role === 'staff') {
      return NextResponse.redirect(`${origin}/admin/dashboard`)
    }
    return NextResponse.redirect(`${origin}/member`)
  }

  // No code provided — redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
