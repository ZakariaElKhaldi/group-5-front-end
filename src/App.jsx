import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RootLayout } from '@/components/layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';

import InterventionsPage from '@/pages/interventions/InterventionsPage';
import InterventionDetailPage from '@/pages/interventions/InterventionDetailPage';
import InterventionFormPage from '@/pages/interventions/InterventionFormPage';
import MachinesPage from '@/pages/machines/MachinesPage';
import MachineFormPage from '@/pages/machines/MachineFormPage';
import MachineDetailPage from '@/pages/machines/MachineDetailPage';
import TechniciensPage from '@/pages/techniciens/TechniciensPage';
import TechnicienFormPage from '@/pages/techniciens/TechnicienFormPage';
import ClientsPage from '@/pages/clients/ClientsPage';
import ClientFormPage from '@/pages/clients/ClientFormPage';
import PannesPage from '@/pages/pannes/PannesPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <RootLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Machines */}
            <Route path="/machines" element={<MachinesPage />} />
            <Route path="/machines/new" element={<MachineFormPage />} />
            <Route path="/machines/:id" element={<MachineDetailPage />} />
            <Route path="/machines/:id/edit" element={<MachineFormPage />} />

            {/* Techniciens */}
            <Route path="/techniciens" element={<TechniciensPage />} />
            <Route path="/techniciens/new" element={<TechnicienFormPage />} />
            <Route path="/techniciens/:id/edit" element={<TechnicienFormPage />} />

            {/* Clients */}
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/new" element={<ClientFormPage />} />
            <Route path="/clients/:id/edit" element={<ClientFormPage />} />

            {/* Pannes */}
            <Route path="/pannes" element={<PannesPage />} />

            {/* Interventions */}
            <Route path="/interventions" element={<InterventionsPage />} />
            <Route path="/interventions/new" element={<InterventionFormPage />} />
            <Route path="/interventions/:id" element={<InterventionDetailPage />} />
            <Route path="/interventions/:id/edit" element={<InterventionFormPage />} />
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
