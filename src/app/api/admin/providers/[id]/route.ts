import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/auth/permissions"

// PATCH: Update provider config
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { authorized, error, status } = await checkAdminAccess('admin')
    if (!authorized) return NextResponse.json({ error }, { status })

    try {
        const body = await req.json()
        // Extract updateable fields to prevent overwriting everything
        const {
            enabled,
            rate_limit_rpm,
            rate_limit_rph,
            cost_per_generation,
            max_duration,
            is_default
        } = body

        const updateData: any = { updated_at: new Date().toISOString() }

        if (enabled !== undefined) updateData.enabled = enabled
        if (rate_limit_rpm !== undefined) updateData.rate_limit_rpm = rate_limit_rpm
        if (rate_limit_rph !== undefined) updateData.rate_limit_rph = rate_limit_rph
        if (cost_per_generation !== undefined) updateData.cost_per_generation = cost_per_generation
        if (max_duration !== undefined) updateData.max_duration = max_duration
        if (is_default !== undefined) updateData.is_default = is_default

        const supabase = await createClient()

        // If setting as default, unset others first if needed (logic can be complex, maybe handle in frontend or multiple queries)
        // For now simple update

        const { data, error: dbError } = await supabase
            .from('provider_configs')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single()

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}
