import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { BarChart3 } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

interface AnalyticsChartProps {
    type: 'line' | 'bar' | 'pie';
    title: string;
    description?: string;
    data: Array<{ [key: string]: string | number }>;
    dataKey: string;
    categoryKey: string;
    colors?: string[];
}

const DEFAULT_COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#c084fc'];

export function AnalyticsChart({
    type,
    title,
    description,
    data,
    dataKey,
    categoryKey,
    colors = DEFAULT_COLORS,
}: AnalyticsChartProps) {
    const hasData = data.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
                        <div className="h-12 w-12 rounded-full glass-panel flex items-center justify-center mb-4">
                            <BarChart3 className="h-6 w-6 text-white/40" />
                        </div>
                        <p className="text-sm text-white/60">No data yet</p>
                        <p className="text-xs text-white/40 mt-1">Data will appear here as it becomes available</p>
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {type === 'line' ? (
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey={categoryKey}
                                        stroke="rgba(255,255,255,0.4)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.4)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={dataKey}
                                        stroke={colors[0]}
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: colors[0] }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            ) : type === 'bar' ? (
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey={categoryKey}
                                        stroke="rgba(255,255,255,0.4)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.4)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            ) : (
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey={dataKey}
                                        nameKey={categoryKey}
                                    >
                                        {data.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                    }} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        wrapperStyle={{ paddingTop: '20px' }}
                                    />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
