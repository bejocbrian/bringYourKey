import { useAdminStore } from '../../store/adminStore';
import { ProviderCard } from '../../components/admin/ProviderCard';
import { Loader2 } from 'lucide-react';

export function AdminProviders() {
    const { providerConfigs, isLoadingProviders, updateProviderConfig } = useAdminStore();

    const handleToggle = (id: string, enabled: boolean) => {
        updateProviderConfig(id, { enabled });
    };

    if (isLoadingProviders && providerConfigs.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Provider Configuration</h1>
                <p className="text-white/60 mt-1">Manage AI video generation providers, rates, and costs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {providerConfigs.map((config) => (
                    <ProviderCard key={config.id} config={config} onToggle={handleToggle} />
                ))}
                {providerConfigs.length === 0 && !isLoadingProviders && (
                    <div className="col-span-full py-12 text-center glass-panel rounded-xl border border-dashed border-white/20">
                        <p className="text-white/60">No provider configurations found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
