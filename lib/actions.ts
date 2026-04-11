"use server"
import { supabaseAdmin } from "./supabase"

export async function getMerchantByEmail(email: string) {
  const { data } = await supabaseAdmin
    .from("merchants")
    .select("*")
    .eq("email", email.toLowerCase())
    .single()
  return data
}

export async function getMerchantLinks(merchantId: string) {
  const { data } = await supabaseAdmin
    .from("payment_links")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getMerchantTransactions(merchantId: string) {
  const { data } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false })
    .limit(100)
  return data ?? []
}

export async function getMerchantStats(merchantId: string) {
  const { data: txns } = await supabaseAdmin
    .from("transactions")
    .select("total_amount,fee_amount,fee_saved,status")
    .eq("merchant_id", merchantId)
    .eq("status", "success")

  const { data: links } = await supabaseAdmin
    .from("payment_links")
    .select("status")
    .eq("merchant_id", merchantId)

  return {
    totalRevenue:  txns?.reduce((s: number, t: any) => s + Number(t.total_amount), 0) ?? 0,
    totalFeeSaved: txns?.reduce((s: number, t: any) => s + Number(t.fee_saved), 0) ?? 0,
    totalTxns:     txns?.length ?? 0,
    activeLinks:   links?.filter((l: any) => l.status === "active").length ?? 0,
    paidLinks:     links?.filter((l: any) => l.status === "paid").length ?? 0,
  }
}

export async function createPaymentLink(data: {
  merchant_id: string
  title: string
  description?: string
  base_amount: number
  fee_pct?: number
  fee_flat?: number
  currency?: string
  gateways?: string[]
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  customer_whatsapp?: string
}) {
  const { data: link, error } = await supabaseAdmin
    .from("payment_links")
    .insert(data)
    .select()
    .single()
  return { link, error: error?.message ?? null }
}

export async function getPaymentLink(ref: string) {
  const { data } = await supabaseAdmin
    .from("payment_links")
    .select("*, merchants(business_name, full_name, upi_id, logo_url)")
    .eq("link_ref", ref)
    .single()
  return data
}
