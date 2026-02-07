"use client"

import { useEffect } from "react"
import { useAdminStore } from "@/lib/store/admin-store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { isFeatureEnabled } = useAdminStore()

    useEffect(() => {
        const isDarkModeEnabled = isFeatureEnabled('dark-mode')

        if (isDarkModeEnabled) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isFeatureEnabled])

    // Re-check on mount and whenever the store changes
    useEffect(() => {
        const unsubscribe = useAdminStore.subscribe((state) => {
            const isDarkModeEnabled = state.isFeatureEnabled('dark-mode')

            if (isDarkModeEnabled) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        })

        return unsubscribe
    }, [])

    return <>{children}</>
}
