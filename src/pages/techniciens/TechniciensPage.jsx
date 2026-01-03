import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

export default function TechniciensPage() {
    const [techniciens, setTechniciens] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });
    const navigate = useNavigate();

    const fetchTechniciens = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: filters.page,
                limit: filters.limit,
                search: filters.search
            });
            const response = await api.get(`/techniciens?${params.toString()}`);
            setTechniciens(response.data.items || []);
            setPagination({
                total: response.data.total,
                page: response.data.page,
                totalPages: response.data.totalPages
            });
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement techniciens');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchTechniciens(), 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce technicien ?')) return;
        try {
            await api.delete(`/techniciens/${id}`);
            fetchTechniciens();
            toast.success('Technicien supprimé');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Techniciens</h1>
                    <p className="text-muted-foreground">Gestion des équipes techniques</p>
                </div>
                <Button onClick={() => navigate('/techniciens/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau Technicien
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher (nom, spécialité)..."
                        className="pl-8"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Spécialité</TableHead>
                            <TableHead>Taux Horaire</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">Chargement...</TableCell></TableRow>
                        ) : techniciens.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Aucun technicien</TableCell></TableRow>
                        ) : (
                            techniciens.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">
                                        <span
                                            className="hover:text-blue-600 hover:underline cursor-pointer"
                                            onClick={() => navigate(`/techniciens/${t.id}`)}
                                        >
                                            {t.user?.nom} {t.user?.prenom}
                                        </span>
                                    </TableCell>
                                    <TableCell>{t.user?.email}</TableCell>
                                    <TableCell>{t.specialite}</TableCell>
                                    <TableCell>{t.tauxHoraire} €/h</TableCell>
                                    <TableCell>
                                        <Badge variant={t.statut === 'Disponible' ? 'secondary' : 'outline'} className={t.statut === 'Disponible' ? 'bg-green-100 text-green-800' : ''}>
                                            {t.statut}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/techniciens/${t.id}`)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/techniciens/${t.id}/edit`)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{pagination.total}</span> techniciens
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
