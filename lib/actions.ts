
"use server"
import { supabaseAdmin } from "./supabase"
import type { Merchant, PaymentLink, Transaction } from "./types"

export async function getMerchantByEmail(email: string): Promise<Merchant | null> {
  const { data } = await supabaseAdmin.from("merchants").select("*").eq("email", email).single()
  return data
}

export async function createMerchant(data: {
  email: string; full_name: string; business_name?: string;
  business_type?: string; country?: string; currency?: string;
}): Promise<{ merchant: Merchant | null; error: string | null }> {
  const { data: merchant, error } = await supabaseAdmin.from("merchants").insert(data).select().single()
  return { merchant, error: error?.message ?? null }
}

export async function createPaymentLink(data: {
  merchant_id: string; title: string; description?: string;
  base_amount: number; fee_pct?: number; fee_flat?: number;
  currency?: string; gateways?: string[];
  customer_name?: string; customer_email?: string;
  customer_phone?: string; customer_whatsapp?: string;
}): Promise<{ link: PaymentLink | null; error: string | null }> {
  const { data: link, error } = await supabaseAdmin.from("payment_links").insert(data).select().single()
  return { link, error: error?.message ?? null }
}

export async function getPaymentLink(ref: string): Promise<any> {
  const { data } = await supabaseAdmin
    .from("payment_links")
    .select("*, merchants(business_name, full_name, upi_id, logo_url)")
    .eq("link_ref", ref)
    .single()
  return data
}

export async function getMerchantLinks(merchantId: string): Promise<PaymentLink[]> {
  const { data } = await supabaseAdmin.from("payment_links").select("*").eq("merchant_id", merchantId).order("created_at", { ascending: false })
  return data ?? []
}

export async function getMerchantTransactions(merchantId: string): Promise<Transaction[]> {
  const { data } = await supabaseAdmin.from("transactions").select("*").eq("merchant_id", merchantId).order("created_at", { ascending: false }).limit(100)
  return data ?? []
}

export async function getMerchantStats(merchantId: string) {
  const { data: txns } = await supabaseAdmin.from("transactions").select("total_amount,fee_amount,fee_saved,status").eq("merchant_id", merchantId).eq("status", "success")
  const { data: links } = await supabaseAdmin.from("payment_links").select("status").eq("merchant_id", merchantId)
  return {
    totalRevenue:  txns?.reduce((s,t) => s + Number(t.total_amount), 0) ?? 0,
    totalFeeSaved: txns?.reduce((s,t) => s + Number(t.fee_saved), 0) ?? 0,
    totalTxns:     txns?.length ?? 0,
    activeLinks:   links?.filter(l => l.status === "active").length ?? 0,
  }
}
