export type Plan = "free" | "starter" | "pro" | "business"
export type Currency = "INR" | "USD" | "GBP" | "EUR" | "AED" | "SGD" | "MYR" | "PHP"
export type Gateway = "upi" | "razorpay" | "stripe" | "bank_transfer"
export type LinkStatus = "active" | "paid" | "expired" | "cancelled"

export interface Merchant {
  id: string
  email: string
  full_name: string
  business_name: string | null
  business_type: string
  country: string
  currency: Currency
  plan: Plan
  default_fee_pct: number
  default_fee_flat: number
  upi_id: string | null
  whatsapp_number: string | null
  phone: string | null
  logo_url: string | null
  is_active: boolean
  onboarding_done: boolean
  created_at: string
}

export interface PaymentLink {
  id: string
  merchant_id: string
  link_ref: string
  title: string
  description: string | null
  base_amount: number
  fee_pct: number
  fee_flat: number
  fee_amount: number
  total_amount: number
  currency: Currency
  gateways: Gateway[]
  status: LinkStatus
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  customer_whatsapp: string | null
  payment_ref: string | null
  gateway_used: string | null
  paid_at: string | null
  expires_at: string
  view_count: number
  created_at: string
}

export interface Transaction {
  id: string
  merchant_id: string
  link_id: string | null
  txn_ref: string
  gateway: string
  gateway_txn_id: string | null
  base_amount: number
  fee_amount: number
  total_amount: number
  currency: Currency
  status: string
  customer_name: string | null
  customer_email: string | null
  fee_saved: number
  created_at: string
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR:"₹", USD:"$", GBP:"£", EUR:"€",
  AED:"د.إ", SGD:"S$", MYR:"RM", PHP:"₱"
}

export const PLAN_PRICE_INR = { starter:499,  pro:999,  business:2499 }
export const PLAN_PRICE_USD = { starter:9,    pro:15,   business:29   }
