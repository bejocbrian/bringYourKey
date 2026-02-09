import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/auth/permissions"

// GET: Get analytics data
export async function GET() {
    const { authorized, error, status } = await checkAdminAccess('admin')
    if (!authorized) return NextResponse.json({ error }, { status })

    const supabase = await createClient()

    // Counts
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

    // Mock data structure for now since we don't have historical data populated
    // In a real app, we would query the 'generations' table with group by date

    const analyticsData = {
        generations: [
            { date: new Date().toISOString().split('T')[0], count: 0, provider: 'google-veo', status: 'success' }
        ],
        providerUsage: [
            { provider: 'google-veo', count: 0, percentage: 0 },
            { provider: 'meta-moviegen', count: 0, percentage: 0 },
            { provider: 'runway-gen3', count: 0, percentage: 0 }
        ],
        topPrompts: {
            words: [],
            count: 0
        },
        overview: {
            totalUsers: usersCount || 0,
            totalGenerations: 0,
            activeUsers24h: 0
        }
    }

    try {
        const { data: recentGenerations, error } = await supabase
            .from('generations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)

        if (recentGenerations && recentGenerations.length > 0) {
            // Simple client-side aggregation for the demo
            analyticsData.overview.totalGenerations = recentGenerations.length // This should be a count query

            // Populate provider usage from real data
            const total = recentGenerations.length
            const usage = recentGenerations.reduce((acc: any, gen: any) => {
                acc[gen.provider] = (acc[gen.provider] || 0) + 1
                return acc
            }, {})

            analyticsData.providerUsage = Object.keys(usage).map(provider => ({
                provider,
                count: usage[provider],
                percentage: Math.round((usage[provider] / total) * 100)
            }))
        }

        // Get true total count
        const { count: totalGen } = await supabase.from('generations').select('*', { count: 'exact', head: true })
        if (totalGen) analyticsData.overview.totalGenerations = totalGen

    } catch (e) {
        console.error("Error fetching analytics", e)
    }

    return NextResponse.json(analyticsData)
}
