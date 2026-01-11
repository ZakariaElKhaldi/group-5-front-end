import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit } from 'lucide-react';

export default function MachinesPage() {
    const [machines, setMachines] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });
    const navigate = useNavigate();

    const fetchMachines = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: filters.page,
                limit: filters.limit,
                search: filters.search
            });
            const response = await api.get(`/machines?${params.toString()}`);
            setMachines(response.data.items || []);
            setPagination({
                total: response.data.total,
                page: response.data.page,
                totalPages: response.data.totalPages
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchMachines(), 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
                    <p className="text-muted-foreground">Gestion du parc machine</p>
                </div>
                {/* <Button onClick={() => navigate('/machines/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle Machine
                </Button> */}
            </div>

            <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher (réf, modèle, dépt)..."
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
                            <TableHead>Référence</TableHead>
                            <TableHead>Modèle</TableHead>
                            <TableHead>Date Achat</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">Chargement...</TableCell></TableRow>
                        ) : machines.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Aucune machine enregistrée</TableCell></TableRow>
                        ) : (
                            machines.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell className="font-medium">{m.reference}</TableCell>
                                    <TableCell>{m.modele}</TableCell>
                                    <TableCell>{m.dateAcquisition ? new Date(m.dateAcquisition).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={m.statut === 'En service' ? 'secondary' : 'destructive'} className={m.statut === 'En service' ? 'bg-green-100 text-green-800' : ''}>
                                            {m.statut}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/machines/${m.id}`)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/machines/${m.id}/edit`)}>
                                            <Edit className="h-4 w-4" />
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
                    Total: <span className="font-medium text-foreground">{pagination.total}</span> machines
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
