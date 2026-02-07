import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Profile, Provider } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadProfile: () => Promise<void>
  clearProfile: () => void
  refreshProfile: () => Promise<void>
  
  // Helpers
  isProviderAllowed: (provider: Provider) => boolean
  getAllowedProviders: () => Provider[]
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,

      loadProfile: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const supabase = createClient()
          
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) {
            set({ profile: null, isLoading: false })
            return
          }

          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          if (error) {
            console.error("Error loading profile:", error)
            set({ error: error.message, isLoading: false })
            return
          }

          set({ profile: profile as Profile, isLoading: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to load profile"
          console.error("Unexpected error loading profile:", err)
          set({ error: message, isLoading: false })
        }
      },

      clearProfile: () => {
        set({ profile: null, error: null })
      },

      refreshProfile: async () => {
        await get().loadProfile()
      },

      isProviderAllowed: (provider: Provider) => {
        const { profile } = get()
        if (!profile) return false
        return profile.allowed_providers.includes(provider)
      },

      getAllowedProviders: () => {
        const { profile } = get()
        if (!profile) return []
        return profile.allowed_providers
      },
    }),
    {
      name: "byok-profile-store",
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
