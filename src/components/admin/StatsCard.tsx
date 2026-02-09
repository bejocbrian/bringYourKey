import { Card, CardContent } from '../ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        isUp: boolean;
    };
    description?: string;
    color?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, description, color = 'purple' }: StatsCardProps) {
    const colorMap: Record<string, string> = {
        purple: 'text-purple-400 bg-purple-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/20',
        rose: 'text-rose-400 bg-rose-500/20',
        blue: 'text-blue-400 bg-blue-500/20',
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-white/60">{title}</p>
                        <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
                    </div>
                    <div className={cn('p-3 rounded-xl', colorMap[color] || colorMap.purple)}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>

                {(trend || description) && (
                    <div className="mt-4 flex items-center gap-2">
                        {trend && (
                            <span
                                className={cn(
                                    'flex items-center text-xs font-medium px-1.5 py-0.5 rounded-md',
                                    trend.isUp
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-rose-500/20 text-rose-400'
                                )}
                            >
                                {trend.isUp ? (
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {trend.value}%
                            </span>
                        )}
                        <span className="text-xs text-white/40">{trend ? trend.label : description}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
