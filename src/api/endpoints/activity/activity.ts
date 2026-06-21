import { supabase } from "@/lib/supabase"
import type { TicketActivity } from "@/types"

// ── API object ───────────────────────────────────────────────────────────────

export const ActivityAPI = {
  fetchActivity: async (ticketId: string): Promise<TicketActivity[]> => {
    const { data, error } = await supabase
      .from("ticket_activity")
      .select("*, actor:profiles(*)")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data as TicketActivity[]) ?? []
  },
}
