import { create } from 'zustand'
import type { Profile, Subscription } from '@/types'

interface UserState {
  profile: Profile | null
  subscription: Subscription | null
  setProfile: (profile: Profile | null) => void
  setSubscription: (subscription: Subscription | null) => void
  clear: () => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  subscription: null,
  setProfile: (profile) => set({ profile }),
  setSubscription: (subscription) => set({ subscription }),
  clear: () => set({ profile: null, subscription: null }),
}))
