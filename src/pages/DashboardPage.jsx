import { useState, useEffect } from 'react';
import api from '@/services/api';
import { DashboardStats, DashboardCharts, TechnicienDashboardStats } from '@/components/dashboard';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin, isTechnicien } = useAuth();

    useEffect(() => {
        // Only fetch admin stats if user is admin
        if (!isAdmin()) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [statsRes, chartsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/charts')
                ]);
                setStats(statsRes.data);
                setChartData(chartsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                toast.error('Erreur lors du chargement du tableau de bord');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin]);

    // Technician Dashboard
    if (isTechnicien() && !isAdmin()) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mon Tableau de bord</h1>
                        <p className="text-muted-foreground">
                            Bienvenue, {user?.prenom || user?.email?.split('@')[0]}
                        </p>
                    </div>
                </div>

                <TechnicienDashboardStats />
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                    <p className="text-muted-foreground">
                        Bienvenue, {user?.prenom || user?.email?.split('@')[0]}
                    </p>
                </div>
            </div>

            <DashboardStats stats={stats} loading={loading} />
            <DashboardCharts data={chartData} loading={loading} />

            {/* Top Machines Section - Optional addition */}
            {!loading && chartData?.topMachines?.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-7">
                        {/* Could add a simple table for top machines here if needed */}
                    </div>
                </div>
            )}
        </div>
    );
}
