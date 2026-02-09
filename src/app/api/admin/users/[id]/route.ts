import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/auth/permissions"

// PATCH: Update user role or providers
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check access - admins can update providers, only superadmins can update roles
  const { authorized, error, status, role: adminRole } = await checkAdminAccess('admin')
  if (!authorized) return NextResponse.json({ error }, { status })

  try {
    const body = await req.json()
    const { role, allowed_providers } = body

    // Only superadmins can change roles
    if (role && adminRole !== 'superadmin') {
      return NextResponse.json({ error: 'Only superadmins can change user roles' }, { status: 403 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    if (role) updateData.role = role
    if (allowed_providers) updateData.allowed_providers = allowed_providers

    const supabase = await createClient()
    const { data, error: dbError } = await supabase
      .from('profiles')
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
