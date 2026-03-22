# ร้านหนังสือ — ระบบจัดการสมาชิกร้านหนังสือ

ระบบจัดการสมาชิกร้านหนังสือ สร้างด้วย Next.js 14, Supabase และ shadcn/ui รองรับการสะสมแต้ม เลื่อนระดับสมาชิก โปรโมชั่น และบันทึกการขาย ครบจบในระบบเดียว

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

## ฟีเจอร์หลัก

- **ระบบสมาชิก** — สมัครสมาชิก, เข้าสู่ระบบ, จัดการโปรไฟล์
- **สะสมแต้ม** — ซื้อหนังสือ 1 บาท = 1 แต้ม, แลกส่วนลดได้
- **เลื่อนระดับอัตโนมัติ** — Silver, Gold, Platinum ตามยอดซื้อสะสม
- **คลังหนังสือ** — จัดการหนังสือ, หมวดหมู่, สต็อก
- **บันทึกการขาย** — บันทึกรายการขาย, ประวัติการขาย
- **โปรโมชั่น** — ลดเปอร์เซ็นต์, ลดราคาคงที่, ซื้อ X แถม Y, คูณคะแนน
- **แดชบอร์ดแอดมิน** — สถิติรายได้, หนังสือขายดี, สมาชิกใหม่
- **พอร์ทัลสมาชิก** — ดูคะแนน, ประวัติการซื้อ, โปรโมชั่นสำหรับคุณ

## โครงสร้างโปรเจกต์

```
app/
├── (auth)/              # หน้าเข้าสู่ระบบ, สมัครสมาชิก
├── (admin)/admin/       # ระบบแอดมิน (แดชบอร์ด, สมาชิก, หนังสือ, การขาย, โปรโมชั่น, คะแนน)
├── (member)/member/     # พอร์ทัลสมาชิก (แดชบอร์ด, ประวัติ, คะแนน, โปรไฟล์, โปรโมชั่น)
├── (marketing)/         # หน้าแรก (Landing page)
└── api/                 # Auth callback, Webhooks

components/
├── admin/               # คอมโพเนนต์ฝั่งแอดมิน
├── auth/                # ฟอร์มเข้าสู่ระบบ & สมัครสมาชิก
├── layout/              # Navbar, Sidebar, Header, Footer
├── marketing/           # Hero, Features, CTA
├── member/              # คอมโพเนนต์ฝั่งสมาชิก
├── shared/              # Providers, Loading spinner
└── ui/                  # shadcn/ui primitives

actions/                 # Server Actions (auth, members, books, sales, points, promotions)
hooks/                   # Custom hooks
stores/                  # Zustand stores
lib/                     # Utilities, validations, Thai strings (th.ts)
utils/supabase/          # Supabase client/server/middleware helpers
supabase/migrations/     # Database schema & RLS policies
```

## เริ่มต้นใช้งาน

### สิ่งที่ต้องมี

- Node.js 18+
- บัญชี [Supabase](https://supabase.com)

### 1. Clone & ติดตั้ง

```bash
git clone https://github.com/plugin87/saas-starterkit.git
cd saas-starterkit
npm install
```

### 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env.local
```

กรอกค่าต่อไปนี้ใน `.env.local`:

| ตัวแปร | แหล่งที่มา |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `NEXTAUTH_SECRET` | รัน `openssl rand -base64 32` |

### 3. ตั้งค่าฐานข้อมูล

รัน migration ผ่าน Supabase SQL Editor หรือ Supabase CLI:

```bash
supabase db push
```

จะสร้างตาราง members, books, categories, sales, points, promotions พร้อม Row Level Security

### 4. รันเซิร์ฟเวอร์

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Scripts

| คำสั่ง | รายละเอียด |
|---|---|
| `npm run dev` | รันเซิร์ฟเวอร์สำหรับพัฒนา |
| `npm run build` | Build สำหรับ production |
| `npm run start` | รัน production server |
| `npm run lint` | ตรวจสอบโค้ดด้วย ESLint |
| `npm run typecheck` | ตรวจสอบ TypeScript types |
| `npm run format` | จัดรูปแบบโค้ดด้วย Prettier |

## ระดับสมาชิก

| ระดับ | สิทธิพิเศษ |
|---|---|
| Silver | ระดับเริ่มต้นเมื่อสมัคร |
| Gold | ส่วนลดเพิ่ม, โปรโมชั่นพิเศษ |
| Platinum | สิทธิพิเศษสูงสุด, ส่วนลดมากที่สุด |

## License

MIT
