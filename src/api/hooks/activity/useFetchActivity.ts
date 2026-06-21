import { useQuery } from "@tanstack/react-query"

import { ActivityAPI } from "@/api/endpoints/activity/activity"

export const activityQueryKey = (ticketId: string | undefined) => ["ticket_activity", ticketId] as const

export function useFetchActivity(ticketId: string | undefined) {
  const query = useQuery({
    queryKey: activityQueryKey(ticketId),
    queryFn: () => ActivityAPI.fetchActivity(ticketId!),
    enabled: Boolean(ticketId),
  })

  return {
    activity: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
