import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Users,
    Settings2,
    AlertTriangle,
    Wrench,
    Search,
    Plus,
    Phone,
    MessageCircle,
    Clock,
    ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ReceptionistDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentPannes, setRecentPannes] = useState([]);
    const [todayInterventions, setTodayInterventions] = useState([]);
    const [clientSearch, setClientSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pannesRes, interventionsRes, clientsRes, machinesRes] = await Promise.all([
                    api.get('/pannes'),
                    api.get('/interventions?statut=En attente'),
                    api.get('/clients'),
                    api.get('/machines'),
                ]);

                setRecentPannes(Array.isArray(pannesRes.data) ? pannesRes.data.slice(0, 5) : (pannesRes.data.items || []).slice(0, 5));
                setTodayInterventions(interventionsRes.data.items?.slice(0, 5) || []);
                setStats({
                    clients: Array.isArray(clientsRes.data) ? clientsRes.data.length : (clientsRes.data.total || 0),
                    machines: machinesRes.data.total || 0,
                    openPannes: Array.isArray(pannesRes.data)
                        ? pannesRes.data.filter(p => p.statut !== 'Resolue').length
                        : (pannesRes.data.items || []).filter(p => p.statut !== 'Resolue').length,
                    pendingInterventions: interventionsRes.data.total || 0,
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Client search with debounce
    useEffect(() => {
        if (!clientSearch.trim()) {
            setSearchResults([]);
            return;
        }

        const searchClients = async () => {
            setSearching(true);
            try {
                const response = await api.get('/clients?limit=100');
                const filtered = (response.data.items || []).filter(c =>
                    c.nom?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    c.telephone?.includes(clientSearch) ||
                    c.email?.toLowerCase().includes(clientSearch.toLowerCase())
                );
                setSearchResults(filtered.slice(0, 5));
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setSearching(false);
            }
        };

        const timer = setTimeout(searchClients, 300);
        return () => clearTimeout(timer);
    }, [clientSearch]);

    const formatPhoneForWhatsApp = (phone) => {
        if (!phone) return null;
        // Remove all non-digits and add Morocco country code if needed
        let cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '212' + cleaned.substring(1);
        }
        return cleaned;
    };

    const getGraviteBadge = (gravite) => {
        const colors = {
            'Faible': 'bg-green-100 text-green-800',
            'Moyenne': 'bg-yellow-100 text-yellow-800',
            'Elevee': 'bg-red-100 text-red-800',
        };
        return colors[gravite] || 'bg-gray-100 text-gray-800';
    };

    const getStatutBadge = (statut) => {
        const colors = {
            'Declaree': 'bg-orange-100 text-orange-800',
            'En traitement': 'bg-blue-100 text-blue-800',
            'Resolue': 'bg-green-100 text-green-800',
        };
        return colors[statut] || 'bg-gray-100 text-gray-800';
    };

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Accueil Réception</h1>
                    <p className="text-muted-foreground">
                        Bienvenue, {user?.prenom || 'Réceptionniste'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/clients/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Nouveau Client
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/machines/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Nouvelle Machine
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/clients')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clients</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.clients || 0}</div>
                        <p className="text-xs text-muted-foreground">Clients enregistrés</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/machines')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Machines</CardTitle>
                        <Settings2 className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.machines || 0}</div>
                        <p className="text-xs text-muted-foreground">Dans le parc</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/pannes')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pannes Ouvertes</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{stats?.openPannes || 0}</div>
                        <p className="text-xs text-muted-foreground">À traiter</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/interventions')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interventions</CardTitle>
                        <Wrench className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pendingInterventions || 0}</div>
                        <p className="text-xs text-muted-foreground">En attente</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Client Search Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Recherche Client Rapide
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Nom, téléphone ou email..."
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {searching && (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                Recherche...
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <div className="space-y-2">
                                {searchResults.map((client) => (
                                    <div
                                        key={client.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium">{client.nom}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {client.telephone || client.email || 'Pas de contact'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {client.telephone && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => window.open(`tel:${client.telephone}`)}
                                                        title="Appeler"
                                                    >
                                                        <Phone className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const phone = formatPhoneForWhatsApp(client.telephone);
                                                            if (phone) {
                                                                window.open(`https://wa.me/${phone}?text=Bonjour ${client.nom}, concernant votre machine...`, '_blank');
                                                            }
                                                        }}
                                                        title="WhatsApp"
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/clients/${client.id}/edit`)}
                                            >
                                                Voir <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {clientSearch && !searching && searchResults.length === 0 && (
                            <div className="text-center py-4">
                                <p className="text-muted-foreground mb-2">Aucun client trouvé</p>
                                <Button variant="outline" onClick={() => navigate('/clients/new')}>
                                    <Plus className="mr-2 h-4 w-4" /> Créer nouveau client
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Pannes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Pannes Récentes
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/pannes')}>
                            Voir tout <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentPannes.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                Aucune panne récente
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentPannes.map((panne) => (
                                    <div
                                        key={panne.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">
                                                    {panne.machine?.modele}
                                                </span>
                                                <Badge className={getGraviteBadge(panne.gravite)}>
                                                    {panne.gravite}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {panne.description}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className={getStatutBadge(panne.statut)}>
                                                {panne.statut}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(panne.dateDeclaration), 'dd MMM', { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Pending Interventions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Interventions en Attente
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/interventions')}>
                        Voir tout <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {todayInterventions.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                            Aucune intervention en attente
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>N°</TableHead>
                                    <TableHead>Machine</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Technicien</TableHead>
                                    <TableHead>Date prévue</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {todayInterventions.map((intervention) => (
                                    <TableRow key={intervention.id}>
                                        <TableCell className="font-medium">#{intervention.id}</TableCell>
                                        <TableCell>{intervention.machine?.modele}</TableCell>
                                        <TableCell>{intervention.machine?.client?.nom || '-'}</TableCell>
                                        <TableCell>
                                            {intervention.technicien
                                                ? `${intervention.technicien.user?.nom} ${intervention.technicien.user?.prenom}`
                                                : <span className="text-muted-foreground italic">Non assigné</span>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(intervention.dateDebut), 'dd MMM yyyy', { locale: fr })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/interventions/${intervention.id}`)}
                                            >
                                                Détails
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
