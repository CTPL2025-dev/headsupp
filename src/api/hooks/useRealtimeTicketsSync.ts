import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"

/**
 * Subscribes to Supabase realtime changes and invalidates the relevant
 * TanStack Query caches. This is a subscription to an external system,
 * not a data fetch — the legitimate use case for useEffect.
 */
export function useRealtimeTicketsSync() {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const channel = supabase
      .channel("tickets-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tickets"] })
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "ticket_comments" }, () => {
        queryClient.invalidateQueries({ queryKey: ["ticket_comments"] })
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "ticket_activity" }, () => {
        queryClient.invalidateQueries({ queryKey: ["ticket_activity"] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
