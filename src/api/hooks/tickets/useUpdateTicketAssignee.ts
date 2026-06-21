import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TicketsAPI, type UpdateTicketAssigneeRequest } from "@/api/endpoints/tickets/tickets"

export function useUpdateTicketAssignee() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, UpdateTicketAssigneeRequest>({
    mutationFn: (variables) => TicketsAPI.updateTicketAssignee(variables),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      queryClient.invalidateQueries({ queryKey: ["ticket_activity", ticketId] })
    },
  })

  return {
    updateTicketAssignee: mutation.mutate,
    updateTicketAssigneeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
