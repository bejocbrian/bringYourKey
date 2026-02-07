import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { Profile } from "@/lib/types"

async function checkIsAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return profile?.role === "admin" || profile?.role === "superadmin"
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const isAdmin = await checkIsAdmin(supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { status, allowed_providers, generations_count, last_active, full_name } = body

    const serviceRoleClient = await createServiceRoleClient()

    // Build update object with only provided fields
    const updateData: Partial<Profile> = {}
    if (status !== undefined) updateData.status = status
    if (allowed_providers !== undefined) updateData.allowed_providers = allowed_providers
    if (generations_count !== undefined) updateData.generations_count = generations_count
    if (last_active !== undefined) updateData.last_active = last_active
    if (full_name !== undefined) updateData.full_name = full_name

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const { data: profile, error } = await serviceRoleClient
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({ user: profile as Profile })
  } catch (error) {
    console.error("Unexpected error in PATCH /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
