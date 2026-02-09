import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { signIn, profile } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            await signIn(email, password);

            // Check if user has admin role
            if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
                setError('You do not have admin privileges');
                setIsLoading(false);
                return;
            }

            navigate('/admin');
        } catch (err: unknown) {
            console.error('Admin login error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-2 mb-8">
                <Shield className="h-8 w-8 text-purple-400" />
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    BYOK <span className="text-purple-400">Admin</span>
                </h1>
            </div>

            <Card className="w-full max-w-md shadow-glow">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Admin Sign in</CardTitle>
                    <CardDescription>Sign in with your admin account to access the panel</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} noValidate>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="glass-panel border border-red-500/50 p-3 rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="admin@example.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <p className="mt-8 text-sm text-white/40 max-w-md text-center">
                Admin access requires a Supabase account with admin or superadmin role. Regular user accounts cannot
                access this panel.
            </p>
        </div>
    );
}
