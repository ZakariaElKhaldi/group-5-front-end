import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    InterventionsBarChart,
    InterventionTypePie,
    TechnicianComparisonBar,
    CostsTrendLine,
    ActivityHeatmap,
    generateActivityHeatmapData,
    InterventionFlowSankey,
    generateInterventionFlowData,
} from '@/components/charts';
import {
    FileText,
    Users,
    Settings2,
    Euro,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle,
    Package,
    CheckCircle,
    ArrowRight,
    Calendar,
    Wrench,
    Settings,
    Grid3X3,
    GitBranch,
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [technicianStats, setTechnicianStats] = useState([]);
    const [lowStockPieces, setLowStockPieces] = useState([]);
    const [pendingValidations, setPendingValidations] = useState([]);
    const [allInterventions, setAllInterventions] = useState([]);
    const [comparisonPeriod, setComparisonPeriod] = useState('month');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartsRes, techniciensRes, piecesRes, allInterventionsRes] = await Promise.all([
                    api.get(`/dashboard/stats?period=${comparisonPeriod}`),
                    api.get('/dashboard/charts'),
                    api.get('/techniciens'),
                    api.get('/pieces/low-stock').catch(() => ({ data: [] })),
                    api.get('/interventions'),
                ]);

                setStats(statsRes.data);
                setChartData(chartsRes.data);
                setAllInterventions(allInterventionsRes.data.items || []);

                // Process technician data for comparison chart
                const technicians = techniciensRes.data.items || [];
                const techData = await Promise.all(
                    technicians.map(async (tech) => {
                        try {
                            const interventions = await api.get(`/techniciens/${tech.id}/interventions`);
                            const completed = interventions.data.filter(i => i.statut === 'Terminee').length;
                            const inProgress = interventions.data.filter(i => i.statut === 'En cours').length;
                            const pending = interventions.data.filter(i => i.statut === 'En attente').length;
                            return {
                                name: `${tech.user?.prenom || ''} ${tech.user?.nom || ''}`.trim() || 'Inconnu',
                                completed,
                                inProgress,
                                pending,
                                total: interventions.data.length,
                            };
                        } catch {
                            return null;
                        }
                    })
                );
                setTechnicianStats(techData.filter(Boolean));

                setLowStockPieces(piecesRes.data.slice(0, 5));

                // Get pending validations
                const interventionsRes = await api.get('/interventions?statut=Terminee&limit=50');
                const pending = (interventionsRes.data.items || []).filter(
                    i => !i.confirmationTechnicien || !i.confirmationClient
                );
                setPendingValidations(pending.slice(0, 5));

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [comparisonPeriod]);

    // Calculate comparison metrics
    const comparisonMetrics = useMemo(() => {
        if (!stats) return null;

        const getMetrics = (current, previous) => {
            const change = current - previous;
            const changePercent = previous > 0 ? ((change / previous) * 100).toFixed(1) :
                (current > 0 ? 100 : 0);
            return {
                current,
                previous,
                change,
                changePercent,
                isPositive: change >= 0
            };
        };

        return {
            interventions: getMetrics(stats.interventions.currentPeriod, stats.interventions.previousPeriod),
            costs: {
                ...getMetrics(stats.costs.currentPeriod, stats.costs.previousPeriod),
                isPositive: stats.costs.currentPeriod <= stats.costs.previousPeriod // Cost decrease is positive
            }
        };
    }, [stats]);

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
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader><Skeleton className="h-6 w-[200px]" /></CardHeader>
                        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
                    </Card>
                    <Card className="col-span-1">
                        <CardHeader><Skeleton className="h-6 w-[200px]" /></CardHeader>
                        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                    <p className="text-muted-foreground">
                        Bienvenue, {user?.prenom || 'Administrateur'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Comparer:</span>
                        <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Mois précédent</SelectItem>
                                <SelectItem value="quarter">Trimestre précédent</SelectItem>
                                <SelectItem value="year">Année précédente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" /> Paramètres
                    </Button>
                </div>
            </div>

            {/* Key Metrics with Comparison */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/interventions')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interventions</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.interventions?.total || 0}</div>
                        <div className="flex items-center text-xs">
                            {comparisonMetrics?.interventions?.isPositive ? (
                                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={comparisonMetrics?.interventions?.isPositive ? 'text-green-600' : 'text-red-600'}>
                                {comparisonMetrics?.interventions?.changePercent}%
                            </span>
                            <span className="text-muted-foreground ml-1">vs mois préc.</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/interventions?priorite=Urgente')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.interventions?.urgent || 0}</div>
                        <p className="text-xs text-muted-foreground">À traiter en priorité</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/techniciens')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Techniciens Dispo</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.techniciens?.available || 0}</div>
                        <p className="text-xs text-muted-foreground">Prêts à intervenir</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/machines')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Machines</CardTitle>
                        <Settings2 className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.machines?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">Parc total</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/pieces')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
                        <Package className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{lowStockPieces.length}</div>
                        <p className="text-xs text-muted-foreground">Pièces en alerte</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
                        <Euro className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.costs?.total?.toLocaleString() || 0} €</div>
                        <p className="text-xs text-muted-foreground">Maintenance cumulée</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            Interventions par Mois
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <InterventionsBarChart data={chartData?.interventionsByMonth || []} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-green-500" />
                            Types d'Intervention
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <InterventionTypePie data={chartData?.interventionsByType || []} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Technician Comparison */}
            {technicianStats.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Comparaison des Techniciens
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/techniciens')}>
                            Voir tout <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <TechnicianComparisonBar data={technicianStats} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Advanced Charts Row: Heatmap and Sankey */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Grid3X3 className="h-5 w-5 text-purple-500" />
                            Activité par Jour/Heure
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ActivityHeatmap data={generateActivityHeatmapData(allInterventions)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-indigo-500" />
                            Flux des Interventions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <InterventionFlowSankey data={generateInterventionFlowData(allInterventions)} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Tables */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Low Stock Alerts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Alertes Stock
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/pieces')}>
                            Voir tout <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {lowStockPieces.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                <p>Aucune alerte de stock</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pièce</TableHead>
                                        <TableHead className="text-center">Stock</TableHead>
                                        <TableHead className="text-center">Seuil</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStockPieces.map((piece) => (
                                        <TableRow key={piece.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/pieces/${piece.id}/edit`)}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{piece.nom}</p>
                                                    <p className="text-xs text-muted-foreground">{piece.reference}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="destructive">{piece.quantiteStock}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {piece.seuilAlerte}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pending Validations */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Validations en Attente
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/interventions?statut=Terminee')}>
                            Voir tout <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {pendingValidations.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                <p>Toutes les interventions sont validées</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Intervention</TableHead>
                                        <TableHead>Tech</TableHead>
                                        <TableHead>Client</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingValidations.map((intervention) => (
                                        <TableRow key={intervention.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/interventions/${intervention.id}`)}>
                                            <TableCell className="font-medium">#{intervention.id}</TableCell>
                                            <TableCell>
                                                {intervention.confirmationTechnicien ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-amber-500" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {intervention.confirmationClient ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-amber-500" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Machines */}
            {chartData?.topMachines?.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Settings2 className="h-5 w-5 text-gray-500" />
                            Machines avec le Plus d'Interventions
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/machines')}>
                            Voir tout <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Modèle</TableHead>
                                    <TableHead className="text-center">Interventions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chartData.topMachines.map((machine, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-mono">{machine.reference}</TableCell>
                                        <TableCell>{machine.modele}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">{machine.interventionCount}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
