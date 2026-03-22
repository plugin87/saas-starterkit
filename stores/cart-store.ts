import { create } from 'zustand'

interface CartItem {
  bookId: string
  title: string
  author: string
  price: number
  quantity: number
  coverImageUrl: string | null
}

interface CartMember {
  id: string
  name: string
  memberCode: string
  membershipTier: string
  availablePoints: number
  discountPercent: number
}

interface CartState {
  items: CartItem[]
  member: CartMember | null
  pointsToRedeem: number
  paymentMethod: 'cash' | 'card' | 'transfer' | 'qr'
  note: string

  // Actions
  addItem: (book: { id: string; title: string; author: string; price: number; cover_image_url: string | null }) => void
  removeItem: (bookId: string) => void
  updateQuantity: (bookId: string, quantity: number) => void
  setMember: (member: CartMember | null) => void
  setPointsToRedeem: (points: number) => void
  setPaymentMethod: (method: 'cash' | 'card' | 'transfer' | 'qr') => void
  setNote: (note: string) => void
  clear: () => void

  // Computed (as functions since Zustand doesn't have computed)
  getSubtotal: () => number
  getTierDiscount: () => number
  getPointsDiscount: () => number
  getTotal: () => number
  getPointsEarned: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  member: null,
  pointsToRedeem: 0,
  paymentMethod: 'cash',
  note: '',

  addItem: (book) => {
    set((state) => {
      const existing = state.items.find((i) => i.bookId === book.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.bookId === book.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        items: [...state.items, {
          bookId: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          quantity: 1,
          coverImageUrl: book.cover_image_url,
        }],
      }
    })
  },

  removeItem: (bookId) => {
    set((state) => ({
      items: state.items.filter((i) => i.bookId !== bookId),
    }))
  },

  updateQuantity: (bookId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(bookId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.bookId === bookId ? { ...i, quantity } : i
      ),
    }))
  },

  setMember: (member) => set({ member, pointsToRedeem: 0 }),
  setPointsToRedeem: (points) => set({ pointsToRedeem: points }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setNote: (note) => set({ note }),
  clear: () => set({ items: [], member: null, pointsToRedeem: 0, paymentMethod: 'cash', note: '' }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  getTierDiscount: () => {
    const member = get().member
    if (!member) return 0
    const subtotal = get().getSubtotal()
    return Math.floor(subtotal * member.discountPercent / 100)
  },

  getPointsDiscount: () => {
    // 100 points = 5 baht
    const points = get().pointsToRedeem
    return Math.floor(points / 100) * 5
  },

  getTotal: () => {
    const subtotal = get().getSubtotal()
    const tierDiscount = get().getTierDiscount()
    const pointsDiscount = get().getPointsDiscount()
    return Math.max(0, subtotal - tierDiscount - pointsDiscount)
  },

  getPointsEarned: () => {
    // 1 baht = 1 point, with tier multiplier
    const total = get().getTotal()
    const member = get().member
    if (!member) return 0
    const multiplier = member.membershipTier === 'platinum' ? 2.0
      : member.membershipTier === 'gold' ? 1.5
      : 1.0
    return Math.floor(total * multiplier)
  },
}))
