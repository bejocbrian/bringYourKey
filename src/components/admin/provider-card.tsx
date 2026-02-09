import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ProviderConfig } from "@/lib/types"

interface ProviderCardProps {
  config: ProviderConfig
  onToggle: (id: string, enabled: boolean) => void
}

export function ProviderCard({ config, onToggle }: ProviderCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold capitalize">
            {config.name}
          </CardTitle>
          <CardDescription>
            {config.is_default && <Badge variant="secondary">Default</Badge>}
          </CardDescription>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => onToggle(config.id, checked)}
        />
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Rate Limit:</span>
            <span className="font-medium text-foreground">{config.rate_limit_rpm} RPM</span>
          </div>
          <div className="flex justify-between">
            <span>Cost:</span>
            <span className="font-medium text-foreground">${config.cost_per_generation} / gen</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium text-foreground">{config.max_duration}s max</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
