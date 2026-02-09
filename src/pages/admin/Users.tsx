import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Search, Filter, Eye, Mail, Ban, Users, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Switch } from '../../components/ui/Switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { useAdminStore } from '../../store/adminStore';
import type { Provider, UserProfile } from '../../types/admin';

const PROVIDERS: Record<Provider, { name: string }> = {
    'google-veo': { name: 'Google Veo' },
    'meta-moviegen': { name: 'Meta MovieGen' },
    'runway-gen3': { name: 'RunwayML Gen-3' },
    'luma-ai': { name: 'Luma AI' },
};

type UserFormState = {
    full_name: string;
    email: string;
    status: UserProfile['status'];
    allowed_providers: Provider[];
};

export function AdminUsers() {
    const { users, isLoadingUsers, loadUsers, updateUserProviders, totalUsers } = useAdminStore();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<UserFormState>({
        full_name: '',
        email: '',
        status: 'active',
        allowed_providers: ['runway-gen3'],
    });

    useEffect(() => {
        if (users.length === 0) loadUsers();
    }, [loadUsers, users.length]);

    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            status: 'active',
            allowed_providers: ['runway-gen3'],
        });
    };

    const openAddUserDialog = () => {
        resetForm();
        setDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            resetForm();
        }
    };

    const handleAddUser = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.full_name.trim() || !formData.email.trim()) {
            alert('Name and email are required.');
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsSubmitting(false);
        setDialogOpen(false);
        resetForm();
    };

    const toggleUserProviderAccess = async (userId: string, provider: Provider) => {
        const user = users.find((u) => u.id === userId);
        if (!user) return;

        const isAllowed = user.allowed_providers.includes(provider);
        const newAllowedProviders = isAllowed
            ? user.allowed_providers.filter((p) => p !== provider)
            : [...user.allowed_providers, provider];

        await updateUserProviders(userId, newAllowedProviders);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'inactive':
                return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            case 'suspended':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            default:
                return 'bg-white/10 text-white/60 border-white/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Users</h1>
                    <p className="text-white/60 mt-1">Manage and monitor application users. Toggle provider access per user.</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" onClick={openAddUserDialog}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>User Directory</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                                <Input placeholder="Search users..." className="pl-10" onChange={(e) => loadUsers(1, e.target.value)} />
                            </div>
                            <Button variant="outline">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingUsers && users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-white/40 mb-4" />
                            <p className="text-sm text-white/60">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-white/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">No users yet</h3>
                            <p className="text-sm text-white/60 max-w-md">
                                Users will appear here when they sign up for the application or when you add them.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-sm text-left text-white/80">
                                    <thead className="text-xs text-white/60 uppercase bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">User</th>
                                            <th className="px-6 py-3 font-semibold">Status</th>
                                            <th className="px-6 py-3 font-semibold">Provider Access</th>
                                            <th className="px-6 py-3 font-semibold">Generations</th>
                                            <th className="px-6 py-3 font-semibold">Last Active</th>
                                            <th className="px-6 py-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                            {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">{user.full_name || 'Unnamed User'}</div>
                                                            <div className="text-xs text-white/60">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(
                                                            user.status
                                                        )}`}
                                                    >
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(Object.keys(PROVIDERS) as Provider[]).map((providerId) => {
                                                            const isAllowed = user.allowed_providers?.includes(providerId);
                                                            const providerName = PROVIDERS[providerId].name;
                                                            return (
                                                                <div
                                                                    key={providerId}
                                                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5"
                                                                    title={providerName}
                                                                >
                                                                    <span className="text-xs font-medium text-white/70 truncate max-w-[80px]">
                                                                        {providerName.split(' ')[0]}
                                                                    </span>
                                                                    <Switch
                                                                        checked={isAllowed}
                                                                        onCheckedChange={() => toggleUserProviderAccess(user.id, providerId)}
                                                                        className="h-4 w-7"
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-white">{user.generations_count}</td>
                                                <td className="px-6 py-4 text-xs text-white/60">
                                                    {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" className="h-8 w-8 p-0" title="View Details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" className="h-8 w-8 p-0" title="Send Email">
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 text-red-400" title="Ban User">
                                                            <Ban className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-white/60">
                                    Showing {users.length} of {totalUsers} users
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" disabled>
                                        Previous
                                    </Button>
                                    <Button variant="outline" disabled>
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                <DialogContent>
                    <form onSubmit={handleAddUser}>
                        <DialogHeader>
                            <DialogTitle>Create new user</DialogTitle>
                            <DialogDescription>Invite a user and configure their provider access.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="user-name">Name</Label>
                                <Input
                                    id="user-name"
                                    placeholder="Jane Doe"
                                    value={formData.full_name}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, full_name: event.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="user-email">Email</Label>
                                <Input
                                    id="user-email"
                                    type="email"
                                    placeholder="jane@company.com"
                                    value={formData.email}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="user-status">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as UserProfile['status'] }))}>
                                    <SelectTrigger id="user-status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Provider access</Label>
                                <div className="flex flex-wrap gap-3">
                                    {(Object.entries(PROVIDERS) as [Provider, { name: string }][]).map(([providerId, provider]) => (
                                        <div key={providerId} className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 bg-white/5">
                                            <Switch
                                                checked={formData.allowed_providers.includes(providerId)}
                                                onCheckedChange={(checked) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        allowed_providers: checked
                                                            ? [...prev.allowed_providers, providerId]
                                                            : prev.allowed_providers.filter((allowed) => allowed !== providerId),
                                                    }))
                                                }
                                            />
                                            <span className="text-sm text-white">{provider.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => handleDialogChange(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create User'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
