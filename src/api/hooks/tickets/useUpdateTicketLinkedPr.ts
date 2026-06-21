import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TicketsAPI, type UpdateTicketLinkedPrRequest } from "@/api/endpoints/tickets/tickets"

export function useUpdateTicketLinkedPr() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, UpdateTicketLinkedPrRequest>({
    mutationFn: (variables) => TicketsAPI.updateTicketLinkedPr(variables),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      queryClient.invalidateQueries({ queryKey: ["ticket_activity", ticketId] })
    },
  })

  return {
    updateTicketLinkedPr: mutation.mutate,
    updateTicketLinkedPrAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
