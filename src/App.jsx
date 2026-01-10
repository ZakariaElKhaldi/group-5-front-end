import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RootLayout } from '@/components/layout';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/auth/ProfilePage';
import DashboardPage from '@/pages/DashboardPage';

// WorkOrders (unified model replacing Pannes + Interventions)
import WorkOrdersPage from '@/pages/workorders/WorkOrdersPage';
import WorkOrderFormPage from '@/pages/workorders/WorkOrderFormPage';
import WorkOrderDetailPage from '@/pages/workorders/WorkOrderDetailPage';

import MachinesPage from '@/pages/machines/MachinesPage';
import MachineFormPage from '@/pages/machines/MachineFormPage';
import MachineDetailPage from '@/pages/machines/MachineDetailPage';
import TechniciensPage from '@/pages/techniciens/TechniciensPage';
import TechnicienFormPage from '@/pages/techniciens/TechnicienFormPage';
import TechnicienDetailPage from '@/pages/techniciens/TechnicienDetailPage';
import ClientsPage from '@/pages/clients/ClientsPage';
import ClientFormPage from '@/pages/clients/ClientFormPage';
import ClientDetailPage from '@/pages/clients/ClientDetailPage';
import PiecesPage from '@/pages/pieces/PiecesPage';
import PieceFormPage from '@/pages/pieces/PieceFormPage';
import StockHistoryPage from '@/pages/pieces/StockHistoryPage';
import FournisseursPage from '@/pages/fournisseurs/FournisseursPage';
import FournisseurFormPage from '@/pages/fournisseurs/FournisseurFormPage';
import FournisseurDetailPage from '@/pages/fournisseurs/FournisseurDetailPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';

// Admin RBAC pages
import UsersPage from '@/pages/users/UsersPage';
import RolesPage from '@/pages/roles/RolesPage';

import CalendarPage from '@/pages/CalendarPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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

            {/* Work Orders - All authenticated users */}
            <Route path="/workorders" element={<WorkOrdersPage />} />
            <Route path="/workorders/new" element={<WorkOrderFormPage />} />
            <Route path="/workorders/:id" element={<WorkOrderDetailPage />} />
            <Route path="/workorders/:id/edit" element={<WorkOrderFormPage />} />

            {/* Legacy Routes Redirects (Strangler Fig Pattern) */}
            <Route path="/interventions/*" element={<Navigate to="/workorders" replace />} />
            <Route path="/pannes/*" element={<Navigate to="/workorders" replace />} />

            {/* Admin-only routes */}
            <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN"><Outlet /></ProtectedRoute>}>
              {/* Settings - Admin only */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications-admin" element={<NotificationsPage />} />

              {/* Users & Roles - Admin only (RBAC) */}
              <Route path="/users" element={<UsersPage />} />
              <Route path="/roles" element={<RolesPage />} />

              {/* Techniciens - Admin only */}
              <Route path="/techniciens" element={<TechniciensPage />} />
              <Route path="/techniciens/new" element={<TechnicienFormPage />} />
              <Route path="/techniciens/:id" element={<TechnicienDetailPage />} />
              <Route path="/techniciens/:id/edit" element={<TechnicienFormPage />} />

              {/* Pièces (Inventory) - Admin only */}
              <Route path="/pieces" element={<PiecesPage />} />
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
              {/* Machines */}
              <Route path="/machines" element={<MachinesPage />} />
              <Route path="/machines/new" element={<MachineFormPage />} />
              <Route path="/machines/:id" element={<MachineDetailPage />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
