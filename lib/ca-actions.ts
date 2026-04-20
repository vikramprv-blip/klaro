"use server"
import { supabaseAdmin } from "./supabase"

// ── Types ──────────────────────────────────────────────────────────────────────

export type CAClient = {
  id: string
  name: string
  entity_type: string
  pan: string | null
  gstin: string | null
  cin: string | null
  email: string | null
  phone: string | null
  tier: "A" | "B" | "C"
  assigned_to: string | null
  services: string[]
  is_active: boolean
  created_at: string
}

export type GSTFiling = {
  id: string
  client_id: string
  return_type: string
  period: string
  due_date: string
  filed_date: string | null
  status: "pending" | "in_progress" | "filed" | "late_filed" | "na"
  turnover: number | null
  tax_liability: number | null
  itc_claimed: number | null
  late_fee: number
  notes: string | null
  assigned_to: string | null
  ca_clients?: { name: string; gstin: string | null }
}

export type ComplianceDeadline = {
  id: string
  compliance_type: string
  description: string
  due_date: string
  penalty_info: string | null
  financial_year: string | null
}

// ── Clients ────────────────────────────────────────────────────────────────────

export async function getCAClients(): Promise<CAClient[]> {
  const { data, error } = await supabaseAdmin
    .from("ca_clients")
    .select("*")
    .eq("is_active", true)
    .order("name")
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function createCAClient(input: Partial<CAClient>) {
  const { data, error } = await supabaseAdmin
    .from("ca_clients")
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCAClient(id: string, input: Partial<CAClient>) {
  const { data, error } = await supabaseAdmin
    .from("ca_clients")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── GST Filings ────────────────────────────────────────────────────────────────

export async function getGSTFilings(filters?: {
  clientId?: string
  status?: string
  period?: string
  returnType?: string
}): Promise<GSTFiling[]> {
  let q = supabaseAdmin
    .from("gst_filings")
    .select("*, ca_clients(name, gstin)")
    .order("due_date", { ascending: true })

  if (filters?.clientId) q = q.eq("client_id", filters.clientId)
  if (filters?.status)   q = q.eq("status", filters.status)
  if (filters?.period)   q = q.eq("period", filters.period)
  if (filters?.returnType) q = q.eq("return_type", filters.returnType)

  const { data, error } = await q
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function updateGSTFiling(id: string, input: Partial<GSTFiling>) {
  const { data, error } = await supabaseAdmin
    .from("gst_filings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function bulkCreateGSTFilings(clientIds: string[], returnType: string, periods: { period: string; due_date: string }[]) {
  const rows = clientIds.flatMap(client_id =>
    periods.map(({ period, due_date }) => ({
      client_id,
      return_type: returnType,
      period,
      due_date,
      status: "pending" as const,
    }))
  )
  const { data, error } = await supabaseAdmin.from("gst_filings").insert(rows).select()
  if (error) throw error
  return data
}

// ── Dashboard stats ────────────────────────────────────────────────────────────

export async function getCADashboardStats() {
  const today = new Date().toISOString().split("T")[0]
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]

  const [clients, gstPending, gstOverdue, upcomingDeadlines] = await Promise.all([
    supabaseAdmin.from("ca_clients").select("id", { count: "exact" }).eq("is_active", true),
    supabaseAdmin.from("gst_filings").select("id", { count: "exact" }).in("status", ["pending", "in_progress"]),
    supabaseAdmin.from("gst_filings").select("id", { count: "exact" }).eq("status", "pending").lt("due_date", today),
    supabaseAdmin.from("compliance_deadlines").select("*").gte("due_date", today).lte("due_date", in7days).order("due_date"),
  ])

  return {
    totalClients: clients.count ?? 0,
    gstPending: gstPending.count ?? 0,
    gstOverdue: gstOverdue.count ?? 0,
    upcomingDeadlines: upcomingDeadlines.data ?? [],
  }
}

// ── Compliance deadlines ───────────────────────────────────────────────────────

export async function getUpcomingDeadlines(days = 30): Promise<ComplianceDeadline[]> {
  const today = new Date().toISOString().split("T")[0]
  const future = new Date(Date.now() + days * 86400000).toISOString().split("T")[0]

  const { data, error } = await supabaseAdmin
    .from("compliance_deadlines")
    .select("*")
    .gte("due_date", today)
    .lte("due_date", future)
    .order("due_date")

  if (error) { console.error(error); return [] }
  return data ?? []
}
