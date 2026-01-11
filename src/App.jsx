import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RootLayout } from '@/components/layout';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Eager load - always needed
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';

// Lazy loaded pages - split into chunks
const ProfilePage = lazy(() => import('@/pages/auth/ProfilePage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));

// WorkOrders
const WorkOrdersPage = lazy(() => import('@/pages/workorders/WorkOrdersPage'));
const WorkOrderFormPage = lazy(() => import('@/pages/workorders/WorkOrderFormPage'));
const WorkOrderDetailPage = lazy(() => import('@/pages/workorders/WorkOrderDetailPage'));

// Machines
const MachinesPage = lazy(() => import('@/pages/machines/MachinesPage'));
const MachineFormPage = lazy(() => import('@/pages/machines/MachineFormPage'));
const MachineDetailPage = lazy(() => import('@/pages/machines/MachineDetailPage'));

// Techniciens (only detail page still used)
const TechnicienDetailPage = lazy(() => import('@/pages/techniciens/TechnicienDetailPage'));

// Clients
const ClientsPage = lazy(() => import('@/pages/clients/ClientsPage'));
const ClientFormPage = lazy(() => import('@/pages/clients/ClientFormPage'));
const ClientDetailPage = lazy(() => import('@/pages/clients/ClientDetailPage'));

// Pieces (Inventory)
const PiecesPage = lazy(() => import('@/pages/pieces/PiecesPage'));
const PieceFormPage = lazy(() => import('@/pages/pieces/PieceFormPage'));
const StockHistoryPage = lazy(() => import('@/pages/pieces/StockHistoryPage'));

// Fournisseurs
const FournisseursPage = lazy(() => import('@/pages/fournisseurs/FournisseursPage'));
const FournisseurFormPage = lazy(() => import('@/pages/fournisseurs/FournisseurFormPage'));
const FournisseurDetailPage = lazy(() => import('@/pages/fournisseurs/FournisseurDetailPage'));

// Settings & Admin
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const MyNotificationsPage = lazy(() => import('@/pages/notifications/MyNotificationsPage'));
const UsersPage = lazy(() => import('@/pages/users/UsersPage'));
const RolesPage = lazy(() => import('@/pages/roles/RolesPage'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes - All authenticated users */}
              <Route
                element={
                  <ProtectedRoute>
                    <RootLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/my-notifications" element={<MyNotificationsPage />} />

                {/* Work Orders - All authenticated users */}
                <Route path="/workorders" element={<WorkOrdersPage />} />
                <Route path="/workorders/new" element={<WorkOrderFormPage />} />
                <Route path="/workorders/:id" element={<WorkOrderDetailPage />} />
                <Route path="/workorders/:id/edit" element={<WorkOrderFormPage />} />

                {/* Legacy Routes Redirects (Strangler Fig Pattern) */}
                <Route path="/interventions/*" element={<Navigate to="/workorders" replace />} />
                <Route path="/pannes/*" element={<Navigate to="/workorders" replace />} />

                {/* Pieces (Inventory) - View accessible to all, edit admin-only */}
                <Route path="/pieces" element={<PiecesPage />} />

                {/* Machines - View detail accessible to all (for technicians to see from work orders) */}
                <Route path="/machines/:id" element={<MachineDetailPage />} />

                {/* Admin-only routes */}
                <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN"><Outlet /></ProtectedRoute>}>
                  {/* Settings - Admin only */}
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/notifications-admin" element={<Navigate to="/my-notifications" replace />} />

                  {/* Users & Roles - Admin only (RBAC) */}
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/roles" element={<RolesPage />} />

                  {/* Techniciens - Redirect to unified users page, keep detail page */}
                  <Route path="/techniciens" element={<Navigate to="/users?tab=technicians" replace />} />
                  <Route path="/techniciens/new" element={<Navigate to="/users?tab=technicians" replace />} />
                  <Route path="/techniciens/:id" element={<TechnicienDetailPage />} />
                  <Route path="/techniciens/:id/edit" element={<Navigate to="/users?tab=technicians" replace />} />

                  {/* Pièces (Inventory) - Create/Edit Admin only */}
                  <Route path="/pieces/new" element={<PieceFormPage />} />
                  <Route path="/pieces/:id/edit" element={<PieceFormPage />} />
                  <Route path="/stock-history" element={<StockHistoryPage />} />

                  {/* Fournisseurs - Admin only */}
                  <Route path="/fournisseurs" element={<FournisseursPage />} />
                  <Route path="/fournisseurs/new" element={<FournisseurFormPage />} />
                  <Route path="/fournisseurs/:id" element={<FournisseurDetailPage />} />
                  <Route path="/fournisseurs/:id/edit" element={<FournisseurFormPage />} />
                </Route>

                {/* Receptionist + Admin routes */}
                <Route element={<ProtectedRoute requiredRole="ROLE_RECEPTIONIST"><Outlet /></ProtectedRoute>}>
                  {/* Machines - List and Edit (Receptionist+Admin only) */}
                  <Route path="/machines" element={<MachinesPage />} />
                  {/* <Route path="/machines/new" element={<MachineFormPage />} /> */}
                  <Route path="/machines/:id/edit" element={<MachineFormPage />} />

                  {/* Clients */}
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/clients/new" element={<ClientFormPage />} />
                  <Route path="/clients/:id" element={<ClientDetailPage />} />
                  <Route path="/clients/:id/edit" element={<ClientFormPage />} />
                </Route>
              </Route>

              {/* Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
