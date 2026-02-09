import { useAdminStore } from '../../store/adminStore';
import { FeatureToggle } from '../../components/admin/FeatureToggle';
import { Shield, Sparkles, Beaker, Loader2 } from 'lucide-react';

export function AdminFeatures() {
    const { features, isLoadingFeatures } = useAdminStore();

    const categories = [
        { id: 'core', name: 'Core Features', icon: Shield },
        { id: 'provider', name: 'Provider Features', icon: Sparkles },
        { id: 'experimental', name: 'Experimental', icon: Beaker },
    ] as const;

    if (isLoadingFeatures && features.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Feature Flags</h1>
                <p className="text-white/60 mt-1">Control application features and roll out new functionality safely.</p>
            </div>

            {categories.map((category) => {
                const categoryFeatures = features.filter((f) => f.category === category.id);

                if (categoryFeatures.length === 0 && category.id !== 'experimental' && !isLoadingFeatures) return null;

                return (
                    <section key={category.id} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                            <category.icon className="h-5 w-5 text-purple-400" />
                            <h2 className="text-xl font-semibold text-white">{category.name}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryFeatures.map((feature) => (
                                <FeatureToggle key={feature.id} feature={feature} />
                            ))}
                            {categoryFeatures.length === 0 && (
                                <div className="col-span-full py-12 text-center glass-panel rounded-xl border border-dashed border-white/20">
                                    <p className="text-white/60">No features in this category yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
