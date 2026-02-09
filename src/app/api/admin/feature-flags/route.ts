import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/auth/permissions"

// GET: List all feature flags
export async function GET() {
    const { authorized, error, status } = await checkAdminAccess('admin')
    if (!authorized) return NextResponse.json({ error }, { status })

    const supabase = await createClient()
    const { data, error: dbError } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: false })

    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

// POST: Create new feature flag (Superadmin only)
export async function POST(req: NextRequest) {
    const { authorized, error, status } = await checkAdminAccess('superadmin')
    if (!authorized) return NextResponse.json({ error }, { status })

    try {
        const body = await req.json()
        const { id, name, description, category, enabled } = body

        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data, error: dbError } = await supabase
            .from('feature_flags')
            .insert([{ id, name, description, category, enabled }])
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
