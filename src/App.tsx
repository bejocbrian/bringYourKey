import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { WorkspaceCanvas } from './components/WorkspaceCanvas';
import { MultiModalSidebar } from './components/MultiModalSidebar';
import { LinearSequencer } from './components/LinearSequencer';
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminFeatures } from './pages/admin/Features';
import { AdminProviders } from './pages/admin/Providers';
import { AdminUsers } from './pages/admin/Users';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sparkles, Shield } from 'lucide-react';
import { useIngredients } from './hooks/useIngredients';

function MainWorkspace() {
  useIngredients();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-panel mx-6 mt-6 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">BYOK Studio</h1>
            <p className="text-xs text-white/50">Bring Your Own Key Video Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 text-sm">
            <span className="text-white/60">Status:</span>{' '}
            <span className="text-green-400 font-semibold">Ready</span>
          </div>
          {isAdmin && (
            <Link
              to="/admin"
              className="glass-panel px-4 py-2 text-sm hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="text-white font-medium">Admin</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Canvas */}
        <WorkspaceCanvas />

        {/* Multi-Modal Sidebar */}
        <MultiModalSidebar />
      </div>

      {/* Linear Sequencer */}
      <LinearSequencer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainWorkspace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/features"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminFeatures />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/providers"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminProviders />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
