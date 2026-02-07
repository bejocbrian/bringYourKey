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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const isAdmin = await checkIsAdmin(supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const serviceRoleClient = await createServiceRoleClient()
    
    const { data: profiles, error } = await serviceRoleClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching profiles:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json({ users: profiles as Profile[] })
  } catch (error) {
    console.error("Unexpected error in GET /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const isAdmin = await checkIsAdmin(supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { email, full_name, status, allowed_providers, generations_count, last_active } = body

    if (!email || !full_name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    const serviceRoleClient = await createServiceRoleClient()

    // Create user via invite
    const { data: authData, error: inviteError } = await serviceRoleClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
    })

    if (inviteError) {
      console.error("Error inviting user:", inviteError)
      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Update the profile with additional fields
    const { error: updateError } = await serviceRoleClient
      .from("profiles")
      .update({
        full_name,
        status: status || "active",
        allowed_providers: allowed_providers || ["meta-moviegen"],
        generations_count: generations_count || 0,
        last_active: last_active || null,
        role: "user",
      })
      .eq("id", authData.user.id)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      // Don't fail the request, the profile will have default values
    }

    // Fetch the created profile
    const { data: profile, error: fetchError } = await serviceRoleClient
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching created profile:", fetchError)
    }

    return NextResponse.json({ 
      user: profile || {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        status: status || "active",
        allowed_providers: allowed_providers || ["meta-moviegen"],
        generations_count: generations_count || 0,
        last_active: last_active || null,
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
