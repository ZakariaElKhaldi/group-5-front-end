import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Clock,
    CheckCircle,
    PlayCircle,
    AlertCircle,
    Wrench,
    User,
    TrendingUp,
    Euro,
    Timer,
    Calendar,
    Star,
} from 'lucide-react';
import { format, startOfMonth, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';

export function TechnicienDashboardStats() {
    const { user, getTechnicienId, getTechnicienStatus, updateTechnicienStatus } = useAuth();
    const [myInterventions, setMyInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const navigate = useNavigate();

    const technicienId = getTechnicienId();

    useEffect(() => {
        const fetchMyInterventions = async () => {
            if (!technicienId) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/techniciens/${technicienId}/workorders`);
                setMyInterventions(response.data);
            } catch (error) {
                console.error('Failed to fetch interventions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyInterventions();
    }, [technicienId]);

    const handleStatusChange = async (newStatus) => {
        setStatusLoading(true);
        try {
            await updateTechnicienStatus(newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    // Calculate stats from interventions
    const stats = useMemo(() => {
        // Use WorkOrder field names (status instead of statut)
        const enAttente = myInterventions.filter(i => i.status === 'reported' || i.status === 'assigned').length;
        const enCours = myInterventions.filter(i => i.status === 'in_progress' || i.status === 'pending_parts').length;
        const terminees = myInterventions.filter(i => i.status === 'completed').length;
        const total = myInterventions.length;

        // Monthly stats - use dateReported instead of dateDebut
        const monthStart = startOfMonth(new Date());
        const thisMonthInterventions = myInterventions.filter(i =>
            i.dateReported && isAfter(new Date(i.dateReported), monthStart)
        );
        const thisMonthCompleted = thisMonthInterventions.filter(i => i.status === 'completed');

        // Calculate total hours worked this month
        // Use actualDuration (in minutes) instead of dureeReelle
        const totalHoursThisMonth = thisMonthCompleted.reduce((acc, i) => {
            return acc + (i.actualDuration ? i.actualDuration / 60 : 0);
        }, 0);

        // Calculate earnings this month
        const tauxHoraire = user?.technicien?.tauxHoraire || 0;
        const earningsThisMonth = totalHoursThisMonth * tauxHoraire;

        // Calculate average duration (in hours)
        const completedWithDuration = myInterventions.filter(i => i.status === 'completed' && i.actualDuration);
        const avgDuration = completedWithDuration.length > 0
            ? completedWithDuration.reduce((acc, i) => acc + (i.actualDuration / 60), 0) / completedWithDuration.length
            : 0;

        return {
            enAttente,
            enCours,
            terminees,
            total,
            thisMonthCompleted: thisMonthCompleted.length,
            totalHoursThisMonth: totalHoursThisMonth.toFixed(1),
            earningsThisMonth: earningsThisMonth.toFixed(2),
            avgDuration: avgDuration.toFixed(1),
            completionRate: total > 0 ? ((terminees / total) * 100).toFixed(0) : 0,
        };
    }, [myInterventions, user]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[60px] mb-1" />
                                <Skeleton className="h-3 w-[140px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const currentStatus = getTechnicienStatus();

    const statusColors = {
        'Disponible': 'bg-green-100 text-green-800 border-green-200',
        'En intervention': 'bg-blue-100 text-blue-800 border-blue-200',
        'Absent': 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mon Tableau de bord</h1>
                    <p className="text-muted-foreground">
                        Bienvenue, {user?.prenom || user?.email?.split('@')[0]}
                    </p>
                </div>
            </div>

            {/* Status Card */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <User className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {user?.prenom} {user?.nom}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {user?.technicien?.specialite || 'Technicien'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Statut:</span>
                            <Select
                                value={currentStatus || 'Disponible'}
                                onValueChange={handleStatusChange}
                                disabled={statusLoading}
                            >
                                <SelectTrigger className={`w-[180px] ${statusColors[currentStatus] || ''}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Disponible">✅ Disponible</SelectItem>
                                    <SelectItem value="En intervention">🔧 En intervention</SelectItem>
                                    <SelectItem value="Absent">⏸️ Absent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Stats - New Row */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                        <TrendingUp className="h-5 w-5" />
                        Mes Performances ce Mois
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/60 rounded-lg">
                            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                            <p className="text-2xl font-bold text-green-700">{stats.thisMonthCompleted}</p>
                            <p className="text-xs text-muted-foreground">Interventions terminées</p>
                        </div>
                        <div className="text-center p-4 bg-white/60 rounded-lg">
                            <Timer className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                            <p className="text-2xl font-bold text-blue-700">{stats.totalHoursThisMonth}h</p>
                            <p className="text-xs text-muted-foreground">Heures travaillées</p>
                        </div>
                        <div className="text-center p-4 bg-white/60 rounded-lg">
                            <Euro className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                            <p className="text-2xl font-bold text-amber-700">{stats.earningsThisMonth}€</p>
                            <p className="text-xs text-muted-foreground">Revenus estimés</p>
                        </div>
                        <div className="text-center p-4 bg-white/60 rounded-lg">
                            <Star className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                            <p className="text-2xl font-bold text-purple-700">{stats.completionRate}%</p>
                            <p className="text-xs text-muted-foreground">Taux de complétion</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Taux horaire: {user?.technicien?.tauxHoraire || 0}€/h • Durée moyenne: {stats.avgDuration}h
                    </p>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/workorders?status=reported')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En attente</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats.enAttente}</div>
                        <p className="text-xs text-muted-foreground">À réaliser</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/workorders?status=in_progress')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En cours</CardTitle>
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.enCours}</div>
                        <p className="text-xs text-muted-foreground">Actuellement actives</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/workorders?status=completed')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Terminées</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.terminees}</div>
                        <p className="text-xs text-muted-foreground">Complétées</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total assignées</CardTitle>
                        <Wrench className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Taux: {user?.technicien?.tauxHoraire || 0}€/h
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent/Urgent Interventions */}
            {(stats.enAttente > 0 || stats.enCours > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Interventions actives
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {myInterventions
                                .filter(i => i.statut === 'En attente' || i.statut === 'En cours')
                                .slice(0, 5)
                                .map((intervention) => (
                                    <div
                                        key={intervention.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                                        onClick={() => navigate(`/workorders/${intervention.id}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={intervention.statut === 'En cours' ? 'default' : 'secondary'}
                                                className={intervention.statut === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}
                                            >
                                                {intervention.statut}
                                            </Badge>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {intervention.machine?.modele} - {intervention.machine?.reference}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {intervention.description?.substring(0, 50)}...
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className={
                                                intervention.priorite === 'Urgente' ? 'border-red-500 text-red-600' :
                                                    intervention.priorite === 'Elevee' ? 'border-orange-500 text-orange-600' :
                                                        'border-gray-300'
                                            }>
                                                {intervention.priorite}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(intervention.dateDebut), 'dd MMM', { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            {myInterventions.filter(i => i.statut === 'En attente' || i.statut === 'En cours').length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Aucune intervention active
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upcoming Scheduled Interventions */}
            {myInterventions.filter(i => i.statut === 'En attente' && i.dateFinPrevue).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            Prochaines Interventions Planifiées
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {myInterventions
                                .filter(i => i.statut === 'En attente' && i.dateFinPrevue)
                                .sort((a, b) => new Date(a.dateFinPrevue) - new Date(b.dateFinPrevue))
                                .slice(0, 3)
                                .map((intervention) => (
                                    <div
                                        key={intervention.id}
                                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer"
                                        onClick={() => navigate(`/workorders/${intervention.id}`)}
                                    >
                                        <span className="text-sm">{intervention.machine?.modele}</span>
                                        <Badge variant="outline">
                                            {format(new Date(intervention.dateFinPrevue), 'dd MMM yyyy', { locale: fr })}
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
