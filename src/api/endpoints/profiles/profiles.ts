import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types"

// ── API object ───────────────────────────────────────────────────────────────

export const ProfilesAPI = {
  fetchProfiles: async (): Promise<Profile[]> => {
    const { data, error } = await supabase.from("profiles").select("*").order("email")
    if (error) throw error
    return data ?? []
  },

  fetchProfileById: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
    if (error) throw error
    return data ?? null
  },
}
