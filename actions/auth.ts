'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { loginSchema, registerSchema } from '@/lib/validations'
import type { LoginInput, RegisterInput } from '@/lib/validations'

export async function login(data: LoginInput) {
  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid input' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function register(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid input' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
    },
  })

  if (error) return { error: error.message }
  return { success: 'Check your email to confirm your account.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function loginWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}
