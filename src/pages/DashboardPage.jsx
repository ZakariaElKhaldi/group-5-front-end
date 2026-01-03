import { DashboardStats, DashboardCharts, TechnicienDashboardStats, ReceptionistDashboard, AdminDashboard } from '@/components/dashboard';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { isAdmin, isTechnicien, isReceptionist } = useAuth();

    // Technician Dashboard
    if (isTechnicien() && !isAdmin()) {
        return <TechnicienDashboardStats />;
    }

    // Receptionist Dashboard
    if (isReceptionist() && !isAdmin()) {
        return <ReceptionistDashboard />;
    }

    // Admin Dashboard (uses new enhanced dashboard with Nivo charts)
    return <AdminDashboard />;
}
