import { useState } from 'react';
import { Type, Image, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { useVideoStore } from '../store/videoStore';
import { TextTab } from './TextTab';
import { ImageTab } from './ImageTab';
import { IngredientsTab } from './IngredientsTab';

type TabType = 'text' | 'image' | 'ingredients';

export function MultiModalSidebar() {
    const { setMode } = useVideoStore();
    const [activeTab, setActiveTab] = useState<TabType>('text');

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === 'text') setMode('t2v');
        if (tab === 'image') setMode('i2v');
        if (tab === 'ingredients') setMode('ingredients');
    };

    const tabs = [
        { id: 'text' as TabType, label: 'Text', icon: Type },
        { id: 'image' as TabType, label: 'Image', icon: Image },
        { id: 'ingredients' as TabType, label: 'Ingredients', icon: Layers },
    ];

    return (
        <div className="w-96 glass-panel m-6 flex flex-col overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-white/10">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 py-4 px-4 transition-all duration-300',
                                'border-b-2 font-medium',
                                isActive
                                    ? 'border-purple-500 text-white bg-white/5'
                                    : 'border-transparent text-white/50 hover:text-white/70 hover:bg-white/5'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'text' && <TextTab />}
                {activeTab === 'image' && <ImageTab />}
                {activeTab === 'ingredients' && <IngredientsTab />}
            </div>
        </div>
    );
}
