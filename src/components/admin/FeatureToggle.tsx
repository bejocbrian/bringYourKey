import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Switch';
import { cn } from '../../lib/utils';
import type { FeatureFlag } from '../../types/admin';

interface FeatureToggleProps {
    feature: FeatureFlag;
}

export function FeatureToggle({ feature }: FeatureToggleProps) {
    const { toggleFeature } = useAdminStore();

    const categoryColors = {
        core: 'default' as const,
        experimental: 'warning' as const,
        provider: 'secondary' as const,
    };

    return (
        <Card
            className={cn(
                'transition-all duration-200',
                feature.enabled ? 'border-purple-500/50 bg-purple-500/10' : ''
            )}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{feature.name}</h3>
                            <Badge variant={categoryColors[feature.category]} className="text-[10px] uppercase px-1.5 py-0">
                                {feature.category}
                            </Badge>
                        </div>
                        <p className="text-sm text-white/60 line-clamp-2">{feature.description}</p>
                        <p className="text-[10px] text-white/40 mt-2">
                            Last updated: {new Date(feature.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                    <Switch checked={feature.enabled} onCheckedChange={(checked) => toggleFeature(feature.id, checked)} />
                </div>
            </CardContent>
        </Card>
    );
}

import { useAdminStore } from '../../store/adminStore';
