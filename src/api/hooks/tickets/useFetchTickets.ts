import { useQuery } from "@tanstack/react-query"

import { TicketsAPI, type TicketFilters } from "@/api/endpoints/tickets/tickets"

export const ticketsQueryKey = (filters: TicketFilters = {}) => ["tickets", "list", filters] as const

export function useFetchTickets(filters: TicketFilters = {}) {
  const query = useQuery({
    queryKey: ticketsQueryKey(filters),
    queryFn: () => TicketsAPI.fetchTickets(filters),
  })

  return {
    tickets: query.data ?? [],
    fetchTickets: query.refetch,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
