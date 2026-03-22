import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  phone: z.string().min(9, 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก').optional(),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
})

export const profileSchema = z.object({
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  bio: z.string().max(160, 'คำอธิบายตัวเองต้องไม่เกิน 160 ตัวอักษร').optional(),
  website: z.string().url('กรุณากรอก URL ให้ถูกต้อง').optional().or(z.literal('')),
})

export const bookSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่อหนังสือ'),
  author: z.string().min(1, 'กรุณากรอกชื่อผู้แต่ง'),
  price: z.number().positive('ราคาต้องมากกว่า 0'),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  description: z.string().optional(),
  stockQuantity: z.number().int('จำนวนต้องเป็นจำนวนเต็ม').nonnegative('จำนวนต้องไม่ติดลบ'),
  lowStockThreshold: z.number().int('จำนวนต้องเป็นจำนวนเต็ม').nonnegative('จำนวนต้องไม่ติดลบ'),
})

export const memberSchema = z.object({
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหมวดหมู่'),
  slug: z.string().min(1, 'กรุณากรอก slug'),
  description: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type BookInput = z.infer<typeof bookSchema>
export type MemberInput = z.infer<typeof memberSchema>
export type CategoryInput = z.infer<typeof categorySchema>
