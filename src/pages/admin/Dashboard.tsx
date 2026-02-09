import { Users, Video, Key, Zap, Activity, Plus } from 'lucide-react';
import { StatsCard } from '../../components/admin/StatsCard';
import { AnalyticsChart } from '../../components/admin/AnalyticsChart';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAdminStore } from '../../store/adminStore';

export function AdminDashboard() {
    const { analytics, users } = useAdminStore();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-white/60 mt-1">Overview of your application performance and usage.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Export Report</Button>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Feature
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Users" value={users.length.toString()} icon={Users} color="blue" />
                <StatsCard
                    title="Generations"
                    value={analytics.generations.reduce((sum, g) => sum + g.count, 0).toString()}
                    icon={Video}
                    color="emerald"
                />
                <StatsCard
                    title="Active Providers"
                    value={analytics.providerUsage.length.toString()}
                    icon={Key}
                    color="amber"
                />
                <StatsCard title="Avg. Cost" value="—" icon={Zap} description="per generation" color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2">
                    <AnalyticsChart
                        type="line"
                        title="Generations Over Time"
                        description="Daily count of video generations across all providers"
                        data={analytics.generations}
                        categoryKey="date"
                        dataKey="count"
                    />
                </div>

                {/* Provider Usage */}
                <div className="lg:col-span-1">
                    <AnalyticsChart
                        type="pie"
                        title="Provider Distribution"
                        description="Usage split by video provider"
                        data={analytics.providerUsage}
                        categoryKey="provider"
                        dataKey="count"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-400" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-full glass-panel flex items-center justify-center mb-4">
                                <Activity className="h-6 w-6 text-white/40" />
                            </div>
                            <p className="text-sm text-white/60">No activity yet</p>
                            <p className="text-xs text-white/40 mt-1">Recent generations will appear here</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Popular Prompts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Popular Prompt Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.topPrompts.words.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-12 w-12 rounded-full glass-panel flex items-center justify-center mb-4">
                                    <Video className="h-6 w-6 text-white/40" />
                                </div>
                                <p className="text-sm text-white/60">No data yet</p>
                                <p className="text-xs text-white/40 mt-1">Popular prompt keywords will appear here</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-2">
                                    {analytics.topPrompts.words.map((word) => (
                                        <span
                                            key={word}
                                            className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30"
                                        >
                                            {word}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-6 p-4 glass-panel rounded-lg">
                                    <p className="text-sm text-white/60">
                                        <span className="font-bold text-white">{analytics.topPrompts.count}</span> unique
                                        prompt combinations analyzed this week.
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
