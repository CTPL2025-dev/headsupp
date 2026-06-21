import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TicketsAPI, type UpdateTicketStatusRequest } from "@/api/endpoints/tickets/tickets"
import type { Ticket } from "@/types"

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, UpdateTicketStatusRequest, { previous: [readonly unknown[], unknown][] }>({
    mutationFn: (variables) => TicketsAPI.updateTicketStatus(variables),
    onMutate: async ({ ticketId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["tickets"] })
      const previous = queryClient.getQueriesData({ queryKey: ["tickets"] })

      queryClient.setQueriesData({ queryKey: ["tickets"] }, (old: unknown) => {
        if (Array.isArray(old)) {
          return old.map((t: Ticket) => (t.id === ticketId ? { ...t, status: newStatus } : t))
        }
        if (old && typeof old === "object" && (old as Ticket).id === ticketId) {
          return { ...old, status: newStatus }
        }
        return old
      })

      return { previous }
    },
    onError: (_err, _variables, context) => {
      context?.previous.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data))
    },
    onSettled: (_data, _error, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      queryClient.invalidateQueries({ queryKey: ["ticket_activity", ticketId] })
    },
  })

  return {
    updateTicketStatus: mutation.mutate,
    updateTicketStatusAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
