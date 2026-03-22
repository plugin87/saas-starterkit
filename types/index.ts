import type { User } from '@supabase/supabase-js'
export type { User }

export type Role = 'admin' | 'staff' | 'member'
export type MembershipTier = 'silver' | 'gold' | 'platinum'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'qr'
export type PromotionType = 'percent_discount' | 'fixed_discount' | 'buy_x_get_y' | 'spend_threshold' | 'bundle' | 'points_multiplier'
export type PointsTransactionType = 'earn' | 'redeem' | 'expire' | 'adjust'

export interface Profile {
  id: string
  name: string | null
  email?: string
  phone: string | null
  address: string | null
  avatarUrl: string | null
  bio: string | null
  website: string | null
  role: Role
  memberCode: string | null
  dateOfBirth: string | null
  membershipTier: MembershipTier
  totalSpent: number
  totalPoints: number
  availablePoints: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MembershipTierConfig {
  id: MembershipTier
  nameTh: string
  nameEn: string
  minSpent: number
  pointsMultiplier: number
  discountPercent: number
  color: string
  sortOrder: number
}

export interface Book {
  id: string
  isbn: string | null
  title: string
  author: string
  publisher: string | null
  categoryId: string | null
  category?: BookCategory
  description: string | null
  coverImageUrl: string | null
  price: number
  costPrice: number | null
  stockQuantity: number
  lowStockThreshold: number
  isActive: boolean
  tags: string[]
  publishedDate: string | null
  createdAt: string
  updatedAt: string
}

export interface BookCategory {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  children?: BookCategory[]
}

export interface Purchase {
  id: string
  memberId: string | null
  member?: Profile
  staffId: string
  staff?: Profile
  subtotal: number
  discountAmount: number
  pointsRedeemed: number
  pointsDiscount: number
  promotionId: string | null
  promotion?: Promotion
  total: number
  pointsEarned: number
  paymentMethod: PaymentMethod
  note: string | null
  items?: PurchaseItem[]
  createdAt: string
}

export interface PurchaseItem {
  id: string
  purchaseId: string
  bookId: string
  book?: Book
  quantity: number
  unitPrice: number
  discountAmount: number
  total: number
}

export interface PointsTransaction {
  id: string
  memberId: string
  purchaseId: string | null
  type: PointsTransactionType
  points: number
  balanceAfter: number
  description: string | null
  createdBy: string | null
  createdAt: string
}

export interface Promotion {
  id: string
  name: string
  description: string | null
  type: PromotionType
  config: Record<string, unknown>
  minTier: MembershipTier | null
  startsAt: string
  endsAt: string
  isActive: boolean
  maxUses: number | null
  usedCount: number
  createdBy: string | null
  books?: Book[]
  createdAt: string
  updatedAt: string
}

export interface BookPair {
  bookAId: string
  bookBId: string
  coPurchaseCount: number
  bookA?: Book
  bookB?: Book
}

export interface ActivityLog {
  id: string
  actorId: string | null
  actor?: Profile
  action: string
  entityType: string | null
  entityId: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
}

export interface StatsCard {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface CartItem {
  book: Book
  quantity: number
  unitPrice: number
  discountAmount: number
}
