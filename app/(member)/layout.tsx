import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { MemberSidebar } from '@/components/layout/member-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'member') {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <MemberSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
