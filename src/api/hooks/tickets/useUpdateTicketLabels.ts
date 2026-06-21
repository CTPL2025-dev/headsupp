import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TicketsAPI, type UpdateTicketLabelsRequest } from "@/api/endpoints/tickets/tickets"

export function useUpdateTicketLabels() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, UpdateTicketLabelsRequest>({
    mutationFn: (variables) => TicketsAPI.updateTicketLabels(variables),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      queryClient.invalidateQueries({ queryKey: ["ticket_activity", ticketId] })
    },
  })

  return {
    updateTicketLabels: mutation.mutate,
    updateTicketLabelsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
