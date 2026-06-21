import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TicketsAPI, type UpdateTicketPriorityRequest } from "@/api/endpoints/tickets/tickets"

export function useUpdateTicketPriority() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, UpdateTicketPriorityRequest>({
    mutationFn: (variables) => TicketsAPI.updateTicketPriority(variables),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      queryClient.invalidateQueries({ queryKey: ["ticket_activity", ticketId] })
    },
  })

  return {
    updateTicketPriority: mutation.mutate,
    updateTicketPriorityAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
