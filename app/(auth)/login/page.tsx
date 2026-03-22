import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'เข้าสู่ระบบ' }

export default function LoginPage() {
  return <LoginForm />
}
