import { useQuery } from "@tanstack/react-query"

import { TicketsAPI } from "@/api/endpoints/tickets/tickets"

export const ticketQueryKey = (ticketId: string | undefined) => ["tickets", "detail", ticketId] as const

export function useFetchTicket(ticketId: string | undefined) {
  const query = useQuery({
    queryKey: ticketQueryKey(ticketId),
    queryFn: () => TicketsAPI.fetchTicketById(ticketId!),
    enabled: Boolean(ticketId),
  })

  return {
    ticket: query.data ?? null,
    fetchTicket: query.refetch,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
