import { useQuery } from "@tanstack/react-query"

import { ProfilesAPI } from "@/api/endpoints/profiles/profiles"

export const profilesQueryKey = () => ["profiles"] as const

export function useFetchProfiles() {
  const query = useQuery({
    queryKey: profilesQueryKey(),
    queryFn: () => ProfilesAPI.fetchProfiles(),
  })

  return {
    profiles: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
