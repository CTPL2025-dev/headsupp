import { supabase } from "@/lib/supabase"
import type { Ticket, TicketPriority, TicketSeverity, TicketStatus } from "@/types"

// ── Types ────────────────────────────────────────────────────────────────────

export type TicketFilters = {
  category?: string
  status?: TicketStatus
  severity?: TicketSeverity
  priority?: TicketPriority
  route?: string
  reporterEmail?: string
  dateFrom?: string
  dateTo?: string
  hasScreenshot?: boolean
  assigneeId?: string | "unassigned"
  label?: string
}

export type UpdateTicketStatusRequest = {
  ticketId: string
  oldStatus: TicketStatus
  newStatus: TicketStatus
  actorId: string
}

export type UpdateTicketPriorityRequest = {
  ticketId: string
  oldPriority: TicketPriority | null
  newPriority: TicketPriority
  actorId: string
}

export type UpdateTicketAssigneeRequest = {
  ticketId: string
  oldAssigneeId: string | null
  newAssigneeId: string | null
  actorId: string
}

export type UpdateTicketLinkedPrRequest = {
  ticketId: string
  oldUrl: string | null
  newUrl: string | null
  actorId: string
}

export type UpdateTicketLabelsRequest = {
  ticketId: string
  oldLabels: string[]
  newLabels: string[]
  actorId: string
}

// ── API object ───────────────────────────────────────────────────────────────

async function logActivity(
  ticketId: string,
  actorId: string,
  field: string,
  oldValue: string | null,
  newValue: string | null
) {
  const { error } = await supabase
    .from("ticket_activity")
    .insert({ ticket_id: ticketId, actor_id: actorId, field, old_value: oldValue, new_value: newValue })
  // Logging is best-effort: the ticket field above has already been updated
  // successfully by this point, so a failure here (e.g. actor has no
  // profiles row yet) shouldn't be reported as if the whole update failed.
  if (error) console.warn("Failed to log ticket activity:", error.message)
}

export const TicketsAPI = {
  fetchTickets: async (filters: TicketFilters = {}): Promise<Ticket[]> => {
    let query = supabase
      .from("tickets")
      .select("*, assignee:profiles(*)")
      .order("created_at", { ascending: false })

    if (filters.category) query = query.eq("category", filters.category)
    if (filters.status) query = query.eq("status", filters.status)
    if (filters.severity) query = query.eq("severity", filters.severity)
    if (filters.priority) query = query.eq("priority", filters.priority)
    if (filters.route) query = query.ilike("route", `%${filters.route}%`)
    if (filters.reporterEmail) query = query.ilike("reporter_email", `%${filters.reporterEmail}%`)
    if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom)
    if (filters.dateTo) query = query.lte("created_at", filters.dateTo)
    if (filters.hasScreenshot) query = query.not("screenshot_url", "is", null)
    if (filters.assigneeId === "unassigned") query = query.is("assignee_id", null)
    else if (filters.assigneeId) query = query.eq("assignee_id", filters.assigneeId)
    if (filters.label) query = query.contains("labels", [filters.label])

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as Ticket[]
  },

  fetchTicketById: async (ticketId: string): Promise<Ticket | null> => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*, assignee:profiles(*)")
      .eq("id", ticketId)
      .maybeSingle()
    if (error) throw error
    return (data as Ticket) ?? null
  },

  updateTicketStatus: async ({
    ticketId,
    oldStatus,
    newStatus,
    actorId,
  }: UpdateTicketStatusRequest): Promise<void> => {
    const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", ticketId)
    if (error) throw error
    await logActivity(ticketId, actorId, "status", oldStatus, newStatus)
  },

  updateTicketPriority: async ({
    ticketId,
    oldPriority,
    newPriority,
    actorId,
  }: UpdateTicketPriorityRequest): Promise<void> => {
    const { error } = await supabase.from("tickets").update({ priority: newPriority }).eq("id", ticketId)
    if (error) throw error
    await logActivity(ticketId, actorId, "priority", oldPriority, newPriority)
  },

  updateTicketAssignee: async ({
    ticketId,
    oldAssigneeId,
    newAssigneeId,
    actorId,
  }: UpdateTicketAssigneeRequest): Promise<void> => {
    const { error } = await supabase
      .from("tickets")
      .update({ assignee_id: newAssigneeId })
      .eq("id", ticketId)
    if (error) throw error
    await logActivity(ticketId, actorId, "assignee", oldAssigneeId, newAssigneeId)
  },

  updateTicketLinkedPr: async ({
    ticketId,
    oldUrl,
    newUrl,
    actorId,
  }: UpdateTicketLinkedPrRequest): Promise<void> => {
    const { error } = await supabase.from("tickets").update({ linked_pr_url: newUrl }).eq("id", ticketId)
    if (error) throw error
    await logActivity(ticketId, actorId, "linked_pr_url", oldUrl, newUrl)
  },

  updateTicketLabels: async ({
    ticketId,
    oldLabels,
    newLabels,
    actorId,
  }: UpdateTicketLabelsRequest): Promise<void> => {
    const { error } = await supabase.from("tickets").update({ labels: newLabels }).eq("id", ticketId)
    if (error) throw error
    await logActivity(ticketId, actorId, "labels", oldLabels.join(", "), newLabels.join(", "))
  },
}
