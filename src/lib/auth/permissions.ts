import { createClient } from "@/lib/supabase/server"

export type AdminRole = 'admin' | 'superadmin'

export const hasPermission = (userRole: string, requiredRole: AdminRole) => {
    if (requiredRole === 'admin') return ['admin', 'superadmin'].includes(userRole)
    if (requiredRole === 'superadmin') return userRole === 'superadmin'
    return false
}

export async function checkAdminAccess(requiredRole: AdminRole = 'admin') {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { authorized: false, error: 'Unauthorized', status: 401 }
    }

    // Check role using the profile table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return { authorized: false, error: 'Profile not found', status: 403 }
    }

    const isAuthorized = hasPermission(profile.role, requiredRole)

    if (!isAuthorized) {
        return { authorized: false, error: 'Insufficient permissions', status: 403 }
    }

    return { authorized: true, user, role: profile.role }
}
