'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Search, User, X, Loader2, Plus, Minus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TierBadge } from '@/components/shared/tier-badge'

import { adjustPoints } from '@/actions/points'
import { createClient } from '@/utils/supabase/client'
import { formatPoints } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export function PointsAdjustForm() {
  const router = useRouter()
  const supabase = createClient()

  // Member search state
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState<MemberResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberResult | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebouncedValue(memberSearch, 300)

  // Form state
  const [points, setPoints] = useState<string>('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ─── Member Search ───────────────────────────────────────────────────────

  const searchMembers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setMemberResults([])
        return
      }
      setIsSearching(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, name, member_code, phone, membership_tier, available_points')
        .eq('role', 'member')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,member_code.ilike.%${query}%`)
        .limit(10)
      setMemberResults(data ?? [])
      setIsSearching(false)
    },
    [supabase]
  )

  useEffect(() => {
    searchMembers(debouncedSearch)
  }, [debouncedSearch, searchMembers])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ─── Handlers ────────────────────────────────────────────────────────────

  function handleSelectMember(member: MemberResult) {
    setSelectedMember(member)
    setMemberSearch('')
    setMemberResults([])
    setShowDropdown(false)
  }

  function handleClearMember() {
    setSelectedMember(null)
    setMemberSearch('')
    setMemberResults([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedMember) {
      toast.error('กรุณาเลือกสมาชิก')
      return
    }

    const pointsNum = Number(points)
    if (!pointsNum || pointsNum === 0) {
      toast.error('กรุณากรอกจำนวนคะแนน (ไม่เป็น 0)')
      return
    }

    if (!description.trim()) {
      toast.error('กรุณากรอกเหตุผล')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.set('memberId', selectedMember.id)
    formData.set('points', String(pointsNum))
    formData.set('description', description)

    const result = await adjustPoints(formData)

    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(
      pointsNum > 0
        ? `เพิ่ม ${formatPoints(pointsNum)} ให้ ${selectedMember.name} เรียบร้อย`
        : `หัก ${formatPoints(Math.abs(pointsNum))} จาก ${selectedMember.name} เรียบร้อย`
    )

    // Reset form
    setSelectedMember(null)
    setPoints('')
    setDescription('')
    router.refresh()
  }

  // ─── Computed ────────────────────────────────────────────────────────────

  const pointsNum = Number(points) || 0
  const isAdding = pointsNum > 0
  const isDeducting = pointsNum < 0

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader>
        <CardTitle>ปรับคะแนนด้วยมือ</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member Search */}
          <div className="space-y-2">
            <Label>สมาชิก</Label>
            {selectedMember ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedMember.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{selectedMember.member_code}</span>
                      <TierBadge tier={selectedMember.membership_tier} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      คะแนนปัจจุบัน: {formatPoints(selectedMember.available_points)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClearMember}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div ref={dropdownRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาสมาชิก (ชื่อ, เบอร์โทร, รหัสสมาชิก)"
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value)
                      setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="pl-9"
                  />
                </div>

                {/* Search results dropdown */}
                {showDropdown && memberSearch && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border bg-background shadow-md max-h-48 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          กำลังค้นหา...
                        </span>
                      </div>
                    ) : memberResults.length > 0 ? (
                      memberResults.map((m) => (
                        <button
                          key={m.id}
                          type="button"
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
                          <div className="flex items-center gap-2 shrink-0">
                            <TierBadge tier={m.membership_tier} />
                            <span className="text-xs text-muted-foreground">
                              {formatPoints(m.available_points)}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        ไม่พบสมาชิก
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Points Input */}
          <div className="space-y-2">
            <Label htmlFor="points">จำนวนคะแนน</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="เช่น 100 หรือ -50"
            />
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Plus className="h-3 w-3 text-green-600" />
                <span>บวก = เพิ่มคะแนน</span>
              </span>
              {' , '}
              <span className="inline-flex items-center gap-1">
                <Minus className="h-3 w-3 text-red-600" />
                <span>ลบ = หักคะแนน</span>
              </span>
            </p>
            {pointsNum !== 0 && selectedMember && (
              <p className={`text-sm font-medium ${isAdding ? 'text-green-600' : 'text-red-600'}`}>
                {isAdding ? 'เพิ่ม' : 'หัก'} {formatPoints(Math.abs(pointsNum))}
                {' '}
                {isDeducting && (
                  <span className="text-muted-foreground font-normal">
                    (คงเหลือหลังหัก: {formatPoints(selectedMember.available_points + pointsNum)})
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">เหตุผล</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุเหตุผลในการปรับคะแนน (จำเป็น)"
              className="min-h-20"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!selectedMember || pointsNum === 0 || !description.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : (
              'ยืนยันปรับคะแนน'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
