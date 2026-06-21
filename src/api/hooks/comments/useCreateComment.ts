import { useMutation, useQueryClient } from "@tanstack/react-query"

import { CommentsAPI, type CreateCommentRequest } from "@/api/endpoints/comments/comments"
import { commentsQueryKey } from "@/api/hooks/comments/useFetchComments"

export function useCreateComment() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, CreateCommentRequest>({
    mutationFn: (variables) => CommentsAPI.createComment(variables),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey(ticketId) })
    },
  })

  return {
    createComment: mutation.mutate,
    createCommentAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
