'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  X,
  ShoppingCart,
  Banknote,
  CreditCard,
  ArrowRightLeft,
  QrCode,
  CheckCircle2,
  Loader2,
  BookOpen,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { TierBadge } from '@/components/shared/tier-badge'

import { useCartStore } from '@/stores/cart-store'
import { recordPurchase } from '@/actions/sales'
import { createClient } from '@/utils/supabase/client'
import { formatCurrency, formatPoints } from '@/lib/utils'
import { th } from '@/lib/th'
import type { PaymentMethod } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BookResult {
  id: string
  title: string
  author: string
  price: number
  stock_quantity: number
  cover_image_url: string | null
}

interface MemberResult {
  id: string
  name: string
  member_code: string
  phone: string | null
  membership_tier: string
  available_points: number
}

// ─── Debounce Hook ───────────────────────────────────────────────────────────

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ─── Payment Method Config ───────────────────────────────────────────────────

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'cash', label: th.sale.cash, icon: <Banknote className="h-4 w-4" /> },
  { value: 'card', label: th.sale.card, icon: <CreditCard className="h-4 w-4" /> },
  { value: 'transfer', label: th.sale.transfer, icon: <ArrowRightLeft className="h-4 w-4" /> },
  { value: 'qr', label: th.sale.qr, icon: <QrCode className="h-4 w-4" /> },
]

// ─── Main POS Interface ──────────────────────────────────────────────────────

export function PosInterface() {
  const supabase = createClient()

  // Book search state
  const [bookSearch, setBookSearch] = useState('')
  const [bookResults, setBookResults] = useState<BookResult[]>([])
  const [isSearchingBooks, setIsSearchingBooks] = useState(false)
  const debouncedBookSearch = useDebouncedValue(bookSearch, 300)

  // Member search state
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState<MemberResult[]>([])
  const [isSearchingMembers, setIsSearchingMembers] = useState(false)
  const [showMemberSearch, setShowMemberSearch] = useState(false)
  const debouncedMemberSearch = useDebouncedValue(memberSearch, 300)

  // Sale state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [saleResult, setSaleResult] = useState<{
    total: number
    pointsEarned: number
    pointsRedeemed: number
  } | null>(null)

  // Cart store
  const {
    items,
    member,
    pointsToRedeem,
    paymentMethod,
    note,
    addItem,
    removeItem,
    updateQuantity,
    setMember,
    setPointsToRedeem,
    setPaymentMethod,
    setNote,
    clear,
    getSubtotal,
    getTierDiscount,
    getPointsDiscount,
    getTotal,
    getPointsEarned,
  } = useCartStore()

  // Ref for member search dropdown
  const memberSearchRef = useRef<HTMLDivElement>(null)

  // ─── Book Search ─────────────────────────────────────────────────────────

  const searchBooks = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setBookResults([])
        return
      }
      setIsSearchingBooks(true)
      const { data } = await supabase
        .from('books')
        .select('id, title, author, price, stock_quantity, cover_image_url')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%`)
        .gt('stock_quantity', 0)
        .limit(20)
      setBookResults(data ?? [])
      setIsSearchingBooks(false)
    },
    [supabase]
  )

  useEffect(() => {
    searchBooks(debouncedBookSearch)
  }, [debouncedBookSearch, searchBooks])

  // ─── Member Search ───────────────────────────────────────────────────────

  const searchMembers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setMemberResults([])
        return
      }
      setIsSearchingMembers(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, name, member_code, phone, membership_tier, available_points')
        .eq('role', 'member')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,member_code.ilike.%${query}%`)
        .limit(10)
      setMemberResults(data ?? [])
      setIsSearchingMembers(false)
    },
    [supabase]
  )

  useEffect(() => {
    searchMembers(debouncedMemberSearch)
  }, [debouncedMemberSearch, searchMembers])

  // Close member search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        memberSearchRef.current &&
        !memberSearchRef.current.contains(event.target as Node)
      ) {
        setShowMemberSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ─── Select Member ───────────────────────────────────────────────────────

  async function handleSelectMember(m: MemberResult) {
    // Look up the tier's discount_percent
    const { data: tierData } = await supabase
      .from('membership_tiers')
      .select('discount_percent')
      .eq('id', m.membership_tier)
      .single()

    setMember({
      id: m.id,
      name: m.name,
      memberCode: m.member_code,
      membershipTier: m.membership_tier,
      availablePoints: m.available_points,
      discountPercent: tierData?.discount_percent ?? 0,
    })
    setMemberSearch('')
    setMemberResults([])
    setShowMemberSearch(false)
  }

  // ─── Handle Add Item ─────────────────────────────────────────────────────

  function handleAddItem(book: BookResult) {
    const existingItem = items.find((i) => i.bookId === book.id)
    if (existingItem && existingItem.quantity >= book.stock_quantity) {
      toast.error(`สต็อกเหลือเพียง ${book.stock_quantity} เล่ม`)
      return
    }
    addItem({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover_image_url: book.cover_image_url,
    })
    toast.success(`เพิ่ม "${book.title}" ลงตะกร้า`)
  }

  // ─── Handle Points Input ─────────────────────────────────────────────────

  function handlePointsChange(value: string) {
    const num = parseInt(value) || 0
    if (!member) return
    // Must be multiple of 100, capped at available points
    const capped = Math.min(num, member.availablePoints)
    setPointsToRedeem(Math.max(0, capped))
  }

  // ─── Confirm Sale ────────────────────────────────────────────────────────

  async function handleConfirmSale() {
    if (items.length === 0) {
      toast.error('กรุณาเพิ่มสินค้าก่อนยืนยันการขาย')
      return
    }

    setIsSubmitting(true)

    const result = await recordPurchase({
      memberId: member?.id ?? null,
      items: items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      pointsToRedeem,
      paymentMethod,
      note: note || '',
    })

    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setSaleResult({
      total: getTotal(),
      pointsEarned: getPointsEarned(),
      pointsRedeemed: pointsToRedeem,
    })
    setShowSuccessDialog(true)
  }

  // ─── Handle New Sale (after success) ─────────────────────────────────────

  function handleNewSale() {
    setShowSuccessDialog(false)
    setSaleResult(null)
    clear()
    setBookSearch('')
    setBookResults([])
  }

  // ─── Computed values ─────────────────────────────────────────────────────

  const subtotal = getSubtotal()
  const tierDiscount = getTierDiscount()
  const pointsDiscount = getPointsDiscount()
  const total = getTotal()
  const pointsEarned = getPointsEarned()

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{th.sale.title}</h1>
        <p className="text-muted-foreground">บันทึกรายการขายและคำนวณส่วนลดอัตโนมัติ</p>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* ═══ Left Column: Book Search + Results (60%) ═══ */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {th.book.search_placeholder}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={th.book.search_placeholder}
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="pl-9"
                />
                {bookSearch && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      setBookSearch('')
                      setBookResults([])
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Loading indicator */}
              {isSearchingBooks && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">{th.loading}</span>
                </div>
              )}

              {/* Book Results */}
              {!isSearchingBooks && bookResults.length > 0 && (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {bookResults.map((book) => {
                    const inCart = items.find((i) => i.bookId === book.id)
                    return (
                      <div
                        key={book.id}
                        className="flex items-center gap-3 rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                      >
                        {/* Cover */}
                        <div className="h-[50px] w-[35px] shrink-0 overflow-hidden rounded-sm bg-muted">
                          {book.cover_image_url ? (
                            <Image
                              src={book.cover_image_url}
                              alt={book.title}
                              width={35}
                              height={50}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              ไม่มี
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                        </div>

                        {/* Price + Stock */}
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm">{formatCurrency(book.price)}</p>
                          <p className="text-xs text-muted-foreground">
                            คงเหลือ {book.stock_quantity}
                          </p>
                        </div>

                        {/* Add Button */}
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(book)}
                          disabled={!!inCart && inCart.quantity >= book.stock_quantity}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {th.add}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Empty state */}
              {!isSearchingBooks && bookSearch && bookResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mb-2" />
                  <p>{th.no_data}</p>
                </div>
              )}

              {/* Initial state */}
              {!bookSearch && bookResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Search className="h-10 w-10 mb-2" />
                  <p>พิมพ์ชื่อหนังสือ ผู้แต่ง หรือ ISBN เพื่อค้นหา</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ═══ Right Column: Cart + Payment (40%) ═══ */}
        <div className="lg:col-span-2 space-y-4">
          {/* ── Member Section ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                สมาชิก
              </CardTitle>
            </CardHeader>
            <CardContent>
              {member ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{member.memberCode}</span>
                        <TierBadge tier={member.membershipTier} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {th.member.available_points}: {formatPoints(member.availablePoints)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setMember(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div ref={memberSearchRef} className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={th.sale.search_member}
                      value={memberSearch}
                      onChange={(e) => {
                        setMemberSearch(e.target.value)
                        setShowMemberSearch(true)
                      }}
                      onFocus={() => setShowMemberSearch(true)}
                      className="pl-9"
                    />
                  </div>

                  {/* Member search results dropdown */}
                  {showMemberSearch && memberSearch && (
                    <div className="rounded-lg border bg-background shadow-md max-h-48 overflow-y-auto">
                      {isSearchingMembers ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">{th.loading}</span>
                        </div>
                      ) : memberResults.length > 0 ? (
                        memberResults.map((m) => (
                          <button
                            key={m.id}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                            onClick={() => handleSelectMember(m)}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{m.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {m.member_code} {m.phone ? `| ${m.phone}` : ''}
                              </p>
                            </div>
                            <TierBadge tier={m.membership_tier} />
                          </button>
                        ))
                      ) : (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          {th.no_data}
                        </div>
                      )}
                    </div>
                  )}

                  {!memberSearch && (
                    <p className="text-xs text-muted-foreground">
                      {th.sale.walk_in}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Cart Items ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  ตะกร้าสินค้า
                </span>
                {items.length > 0 && (
                  <Badge variant="secondary">{items.length} {th.items}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mb-2" />
                  <p className="text-sm">{th.sale.empty_cart}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[35vh] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.bookId} className="flex items-center gap-3">
                      {/* Cover */}
                      <div className="h-[40px] w-[28px] shrink-0 overflow-hidden rounded-sm bg-muted">
                        {item.coverImageUrl ? (
                          <Image
                            src={item.coverImageUrl}
                            alt={item.title}
                            width={28}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[8px] text-muted-foreground">
                            -
                          </div>
                        )}
                      </div>

                      {/* Title + Price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} x {item.quantity} = {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeItem(item.bookId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Points Redemption (only with member) ── */}
          {member && member.availablePoints > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{th.sale.points_redeemed}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={member.availablePoints}
                    step={100}
                    value={pointsToRedeem || ''}
                    onChange={(e) => handlePointsChange(e.target.value)}
                    placeholder="0"
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    / {formatPoints(member.availablePoints)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {th.points.redeem_rate} | ส่วนลด: {formatCurrency(getPointsDiscount())}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── Payment Summary ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">สรุปยอด</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{th.sale.subtotal}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {/* Tier Discount */}
              {member && tierDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {th.sale.tier_discount} {member.discountPercent}%
                  </span>
                  <span className="text-green-600">-{formatCurrency(tierDiscount)}</span>
                </div>
              )}

              {/* Points Discount */}
              {pointsToRedeem > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{th.sale.points_discount}</span>
                  <span className="text-green-600">-{formatCurrency(pointsDiscount)}</span>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{th.sale.total}</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>

              {/* Points Earned */}
              {member && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{th.sale.points_earned}</span>
                  <span className="text-blue-600 font-medium">{formatPoints(pointsEarned)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Payment Method ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{th.sale.payment_method}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {paymentMethods.map((pm) => (
                  <Button
                    key={pm.value}
                    variant={paymentMethod === pm.value ? 'default' : 'outline'}
                    size="sm"
                    className="flex-col gap-1 h-auto py-2"
                    onClick={() => setPaymentMethod(pm.value)}
                  >
                    {pm.icon}
                    <span className="text-[10px]">{pm.label}</span>
                  </Button>
                ))}
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{th.sale.note}</label>
                <Textarea
                  placeholder="เพิ่มหมายเหตุ (ไม่จำเป็น)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-12 text-sm"
                />
              </div>

              {/* Confirm Button */}
              <Button
                className="w-full h-12 text-base font-bold"
                size="lg"
                disabled={items.length === 0 || isSubmitting}
                onClick={handleConfirmSale}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {th.sale.confirm_sale}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ Success Dialog ═══ */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              {th.sale.sale_success}!
            </DialogTitle>
            <DialogDescription>
              รายการขายถูกบันทึกเรียบร้อยแล้ว
            </DialogDescription>
          </DialogHeader>

          {saleResult && (
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{th.sale.total}</span>
                <span className="font-semibold">{formatCurrency(saleResult.total)}</span>
              </div>
              {saleResult.pointsEarned > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{th.sale.points_earned}</span>
                  <span className="font-semibold text-blue-600">
                    {formatPoints(saleResult.pointsEarned)}
                  </span>
                </div>
              )}
              {saleResult.pointsRedeemed > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{th.sale.points_redeemed}</span>
                  <span className="font-semibold text-orange-600">
                    {formatPoints(saleResult.pointsRedeemed)}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleNewSale} className="w-full">
              ขายรายการใหม่
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
