import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Switch';
import type { ProviderConfig } from '../../types/admin';

interface ProviderCardProps {
    config: ProviderConfig;
    onToggle: (id: string, enabled: boolean) => void;
}

export function ProviderCard({ config, onToggle }: ProviderCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-bold capitalize">{config.name}</CardTitle>
                    <CardDescription>
                        {config.is_default && (
                            <Badge variant="success" className="text-[10px]">
                                Default
                            </Badge>
                        )}
                    </CardDescription>
                </div>
                <Switch checked={config.enabled} onCheckedChange={(checked) => onToggle(config.id, checked)} />
            </CardHeader>
            <CardContent>
                <div className="text-xs text-white/60 space-y-1">
                    <div className="flex justify-between">
                        <span>Rate Limit:</span>
                        <span className="font-medium text-white">{config.rate_limit_rpm} RPM</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="font-medium text-white">
                            ${config.cost_per_generation} / gen
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium text-white">{config.max_duration}s max</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
