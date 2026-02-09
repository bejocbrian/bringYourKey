import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/auth/permissions"

// GET: Get all app settings
export async function GET() {
    const { authorized, error, status } = await checkAdminAccess('admin')
    if (!authorized) return NextResponse.json({ error }, { status })

    const supabase = await createClient()
    const { data, error: dbError } = await supabase
        .from('app_settings')
        .select('*')

    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Transform array to object usually preferred by frontend
    const settingsObject = data ? data.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
    }, {} as Record<string, any>) : {}

    return NextResponse.json(settingsObject)
}

// PATCH: Update app settings
export async function PATCH(req: NextRequest) {
    const { authorized, error, status } = await checkAdminAccess('superadmin') // Typically restricting global settings to superadmin is safer
    if (!authorized) return NextResponse.json({ error }, { status })

    try {
        const body = await req.json()
        const { key, value } = body

        if (!key || !value) {
            return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data, error: dbError } = await supabase
            .from('app_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() })
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
