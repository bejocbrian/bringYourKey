"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/lib/store/admin-store"

export function ThemeToggle() {
    const { settings, updateSettings } = useAdminStore()
    const [isDark, setIsDark] = useState(settings.theme.darkMode)

    useEffect(() => {
        // Sync with admin store
        setIsDark(settings.theme.darkMode)

        // Apply theme to document
        if (settings.theme.darkMode) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [settings.theme.darkMode])

    const toggleTheme = () => {
        const newIsDark = !isDark

        // Update admin store settings
        updateSettings({
            ...settings,
            theme: {
                ...settings.theme,
                darkMode: newIsDark
            }
        })
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </Button>
    )
}
