import { useQuery } from "@tanstack/react-query"

import { ProfilesAPI } from "@/api/endpoints/profiles/profiles"

export const profileQueryKey = (userId: string | undefined) => ["profiles", userId] as const

export function useFetchProfile(userId: string | undefined) {
  const query = useQuery({
    queryKey: profileQueryKey(userId),
    queryFn: () => ProfilesAPI.fetchProfileById(userId!),
    enabled: Boolean(userId),
  })

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
