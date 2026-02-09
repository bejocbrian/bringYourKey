import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Flag, Boxes, Users, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/features', label: 'Features', icon: Flag },
        { path: '/admin/providers', label: 'Providers', icon: Boxes },
        { path: '/admin/users', label: 'Users', icon: Users },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 glass-panel m-6 mr-0 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">BYOK Admin</h2>
                        <p className="text-xs text-white/40">Control Panel</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                                    isActive
                                        ? 'bg-purple-500/20 text-white border border-purple-500/30'
                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-white/10">
                    <div className="glass-panel p-4 mb-4">
                        <p className="text-xs text-white/40 mb-1">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                            {profile?.role}
                        </span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
    );
}
