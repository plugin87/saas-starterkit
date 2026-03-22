'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { Subscription } from '@/types'

export function useSubscription(userId: string | undefined) {
  const supabase = createClient()

  return useQuery<Subscription | null>({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      return data
    },
    enabled: !!userId,
  })
}
