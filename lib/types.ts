export type Plan = "free" | "starter" | "pro" | "business"
export type Currency = string
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
  apps: string[] | null
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


export const ALL_CURRENCIES = [
  { code:"INR", symbol:"₹",    name:"Indian Rupee",         country:"India" },
  { code:"USD", symbol:"$",    name:"US Dollar",            country:"United States" },
  { code:"EUR", symbol:"€",    name:"Euro",                 country:"Europe" },
  { code:"GBP", symbol:"£",    name:"British Pound",        country:"United Kingdom" },
  { code:"AED", symbol:"د.إ", name:"UAE Dirham",           country:"UAE" },
  { code:"SGD", symbol:"S$",   name:"Singapore Dollar",     country:"Singapore" },
  { code:"MYR", symbol:"RM",   name:"Malaysian Ringgit",    country:"Malaysia" },
  { code:"PHP", symbol:"₱",    name:"Philippine Peso",      country:"Philippines" },
  { code:"IDR", symbol:"Rp",   name:"Indonesian Rupiah",    country:"Indonesia" },
  { code:"THB", symbol:"฿",    name:"Thai Baht",            country:"Thailand" },
  { code:"BDT", symbol:"৳",    name:"Bangladeshi Taka",     country:"Bangladesh" },
  { code:"LKR", symbol:"Rs",   name:"Sri Lankan Rupee",     country:"Sri Lanka" },
  { code:"NPR", symbol:"Rs",   name:"Nepali Rupee",         country:"Nepal" },
  { code:"PKR", symbol:"Rs",   name:"Pakistani Rupee",      country:"Pakistan" },
  { code:"KES", symbol:"KSh",  name:"Kenyan Shilling",      country:"Kenya" },
  { code:"NGN", symbol:"₦",    name:"Nigerian Naira",       country:"Nigeria" },
  { code:"ZAR", symbol:"R",    name:"South African Rand",   country:"South Africa" },
  { code:"BRL", symbol:"R$",   name:"Brazilian Real",       country:"Brazil" },
  { code:"MXN", symbol:"$",    name:"Mexican Peso",         country:"Mexico" },
  { code:"CAD", symbol:"C$",   name:"Canadian Dollar",      country:"Canada" },
  { code:"AUD", symbol:"A$",   name:"Australian Dollar",    country:"Australia" },
  { code:"NZD", symbol:"NZ$",  name:"New Zealand Dollar",   country:"New Zealand" },
  { code:"HKD", symbol:"HK$",  name:"Hong Kong Dollar",     country:"Hong Kong" },
  { code:"JPY", symbol:"¥",    name:"Japanese Yen",         country:"Japan" },
  { code:"CNY", symbol:"¥",    name:"Chinese Yuan",         country:"China" },
  { code:"KRW", symbol:"₩",    name:"South Korean Won",     country:"South Korea" },
  { code:"VND", symbol:"₫",    name:"Vietnamese Dong",      country:"Vietnam" },
  { code:"TWD", symbol:"NT$",  name:"Taiwan Dollar",        country:"Taiwan" },
]

export const CURRENCY_SYMBOLS: Record<string,string> = Object.fromEntries(
  ALL_CURRENCIES.map(c => [c.code, c.symbol])
)

export const COUNTRY_TO_CURRENCY: Record<string,string> = {
  IN:"INR", US:"USD", GB:"GBP", AE:"AED", SG:"SGD", MY:"MYR",
  PH:"PHP", ID:"IDR", TH:"THB", BD:"BDT", LK:"LKR", NP:"NPR",
  PK:"PKR", KE:"KES", NG:"NGN", ZA:"ZAR", BR:"BRL", MX:"MXN",
  CA:"CAD", AU:"AUD", NZ:"NZD", HK:"HKD", JP:"JPY", CN:"CNY",
  KR:"KRW", VN:"VND", TW:"TWD", DE:"EUR", FR:"EUR", IT:"EUR",
  ES:"EUR", NL:"EUR", BE:"EUR", PT:"EUR", AT:"EUR", IE:"EUR",
}


export const PLAN_PRICE_INR = { starter:499,  pro:999,  business:2499 }
export const PLAN_PRICE_USD = { starter:9,    pro:15,   business:29   }
