import { create } from 'zustand'
import type { Profile, Role, MembershipTier } from '@/types'

interface UserState {
  profile: Profile | null
  role: Role | null
  membershipTier: MembershipTier | null
  availablePoints: number
  setProfile: (profile: Profile | null) => void
  setRole: (role: Role | null) => void
  setMembershipTier: (membershipTier: MembershipTier | null) => void
  setAvailablePoints: (availablePoints: number) => void
  clear: () => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  role: null,
  membershipTier: null,
  availablePoints: 0,
  setProfile: (profile) => set({ profile }),
  setRole: (role) => set({ role }),
  setMembershipTier: (membershipTier) => set({ membershipTier }),
  setAvailablePoints: (availablePoints) => set({ availablePoints }),
  clear: () => set({ profile: null, role: null, membershipTier: null, availablePoints: 0 }),
}))
