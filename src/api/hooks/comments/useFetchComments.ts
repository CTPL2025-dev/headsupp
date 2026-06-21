import { useQuery } from "@tanstack/react-query"

import { CommentsAPI } from "@/api/endpoints/comments/comments"

export const commentsQueryKey = (ticketId: string | undefined) => ["ticket_comments", ticketId] as const

export function useFetchComments(ticketId: string | undefined) {
  const query = useQuery({
    queryKey: commentsQueryKey(ticketId),
    queryFn: () => CommentsAPI.fetchComments(ticketId!),
    enabled: Boolean(ticketId),
  })

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
