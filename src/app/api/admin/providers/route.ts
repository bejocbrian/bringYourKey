import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/auth/permissions"

// GET: List all provider configs
export async function GET() {
    const { authorized, error, status } = await checkAdminAccess('admin')
    if (!authorized) return NextResponse.json({ error }, { status })

    const supabase = await createClient()
    const { data, error: dbError } = await supabase
        .from('provider_configs')
        .select('*')
        .order('name')

    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
