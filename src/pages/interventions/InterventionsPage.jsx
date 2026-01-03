import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatusBadge, PriorityBadge } from '@/components/interventions/Badges';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function InterventionsPage() {
    const [interventions, setInterventions] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        statut: 'all',
        priorite: 'all',
        search: '',
    });
    const navigate = useNavigate();
    const { user, isTechnicien, isAdmin, getTechnicienId } = useAuth();

    const fetchInterventions = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams({
                page: filters.page,
                limit: filters.limit,
            });
            if (filters.statut !== 'all') params.append('statut', filters.statut);
            if (filters.priorite !== 'all') params.append('priorite', filters.priorite);
            if (filters.search) params.append('search', filters.search);

            // If technician, filter by their ID
            if (isTechnicien() && !isAdmin()) {
                const techId = getTechnicienId();
                if (techId) {
                    params.append('technicien', techId);
                }
            }

            const response = await api.get(`/interventions?${params.toString()}`);
            setInterventions(response.data.items || []);
            setPagination({
                total: response.data.total,
                page: response.data.page,
                totalPages: response.data.totalPages
            });
        } catch (error) {
            console.error('Error fetching interventions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptIntervention = async (interventionId) => {
        try {
            const techId = getTechnicienId();
            await api.put(`/interventions/${interventionId}`, {
                technicienId: techId
            });
            toast.success('Intervention acceptée avec succès');
            fetchInterventions();
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de l\'acceptation');
        }
    };

    useEffect(() => {
        fetchInterventions();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interventions</h1>
                    <p className="text-muted-foreground">
                        Gérez les demandes et le suivi des maintenances
                    </p>
                </div>
                <Button onClick={() => navigate('/interventions/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle Intervention
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher (machine, technicien, description)..."
                            className="pl-8 w-full max-w-sm"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>
                <Select
                    value={filters.statut}
                    onValueChange={(val) => handleFilterChange('statut', val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="En attente">En attente</SelectItem>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="Terminee">Terminée</SelectItem>
                        <SelectItem value="Annulee">Annulée</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.priorite}
                    onValueChange={(val) => handleFilterChange('priorite', val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes priorités</SelectItem>
                        <SelectItem value="Normale">Normale</SelectItem>
                        <SelectItem value="Elevee">Élevée</SelectItem>
                        <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Numéro</TableHead>
                            <TableHead>Machine</TableHead>
                            <TableHead>Technicien</TableHead>
                            <TableHead>Priorité</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date Début</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    Chargement...
                                </TableCell>
                            </TableRow>
                        ) : interventions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    Aucune intervention trouvée
                                </TableCell>
                            </TableRow>
                        ) : (
                            interventions.map((intervention) => (
                                <TableRow key={intervention.id}>
                                    <TableCell className="font-medium">#{intervention.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{intervention.machine?.modele}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {intervention.machine?.reference}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {intervention.technicien ? (
                                            <span className="text-sm">
                                                {intervention.technicien.user?.nom} {intervention.technicien.user?.prenom}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">Non assigné</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <PriorityBadge priority={intervention.priorite} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={intervention.statut} />
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(intervention.dateDebut), 'dd MMM yyyy', { locale: fr })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate(`/interventions/${intervention.id}`)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {isTechnicien() && intervention.statut === 'En attente' && !intervention.technicien && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptIntervention(intervention.id);
                                                }}
                                            >
                                                Accepter
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{pagination.total}</span> interventions
                </p>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        Page <span className="font-medium text-foreground">{pagination.page}</span> sur {pagination.totalPages || 1}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                            disabled={filters.page === 1 || loading}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFilterChange('page', filters.page + 1)}
                            disabled={filters.page >= pagination.totalPages || loading}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
