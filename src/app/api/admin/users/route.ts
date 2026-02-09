import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/auth/permissions"

// GET: List all users
export async function GET(req: NextRequest) {
  const { authorized, error, status } = await checkAdminAccess('admin')
  if (!authorized) return NextResponse.json({ error }, { status })

  const searchParams = req.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''

  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = await createClient()
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data, error: dbError, count } = await query

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({
    users: data,
    metadata: {
      total: count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0
    }
  })
}
