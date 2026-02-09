import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/auth/permissions"

// PATCH: Update feature flag
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { authorized, error, status } = await checkAdminAccess('admin')
    if (!authorized) return NextResponse.json({ error }, { status })

    try {
        const body = await req.json()
        const { enabled, description, category } = body

        const supabase = await createClient()
        const { data, error: dbError } = await supabase
            .from('feature_flags')
            .update({ enabled, description, category, updated_at: new Date().toISOString() })
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

// DELETE: Delete feature flag (Superadmin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { authorized, error, status } = await checkAdminAccess('superadmin')
    if (!authorized) return NextResponse.json({ error }, { status })

    const supabase = await createClient()
    const { error: dbError } = await supabase
        .from('feature_flags')
        .delete()
        .eq('id', params.id)

    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
