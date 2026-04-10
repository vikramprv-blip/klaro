
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
  upi_id: string | null
  is_active: boolean
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
  fee_amount: number
  total_amount: number
  currency: Currency
  gateways: Gateway[]
  status: LinkStatus
  customer_name: string | null
  customer_email: string | null
  paid_at: string | null
  expires_at: string
  created_at: string
}

export interface Transaction {
  id: string
  merchant_id: string
  txn_ref: string
  gateway: string
  base_amount: number
  fee_amount: number
  total_amount: number
  currency: Currency
  status: string
  customer_name: string | null
  fee_saved: number
  created_at: string
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR:"₹", USD:"$", GBP:"£", EUR:"€", AED:"د.إ", SGD:"S$", MYR:"RM", PHP:"₱"
}
