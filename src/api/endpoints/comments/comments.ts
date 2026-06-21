import { supabase } from "@/lib/supabase"
import type { TicketComment } from "@/types"

// ── Types ────────────────────────────────────────────────────────────────────

export type CreateCommentRequest = {
  ticketId: string
  authorId: string
  body: string
}

// ── API object ───────────────────────────────────────────────────────────────

export const CommentsAPI = {
  fetchComments: async (ticketId: string): Promise<TicketComment[]> => {
    const { data, error } = await supabase
      .from("ticket_comments")
      .select("*, author:profiles(*)")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })
    if (error) throw error
    return (data as TicketComment[]) ?? []
  },

  createComment: async ({ ticketId, authorId, body }: CreateCommentRequest): Promise<void> => {
    const { error } = await supabase
      .from("ticket_comments")
      .insert({ ticket_id: ticketId, author_id: authorId, body })
    if (error) throw error
  },
}
