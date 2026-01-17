import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Truck, Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

export default function FournisseursPage() {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });
    const navigate = useNavigate();

    const fetchFournisseurs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: filters.page,
                limit: filters.limit,
                search: filters.search
            });
            const response = await api.get(`/fournisseurs?${params.toString()}`);
            setFournisseurs(response.data.items || []);
            setPagination({
                total: response.data.total,
                page: response.data.page,
                totalPages: response.data.totalPages
            });
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement fournisseurs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchFournisseurs(), 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) return;
        try {
            await api.delete(`/fournisseurs/${id}`);
            fetchFournisseurs();
            toast.success('Fournisseur supprimé');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Fournisseurs
                    </h1>
                    <p className="text-muted-foreground">Gestion des fournisseurs de pièces</p>
                </div>
                <Button onClick={() => navigate('/fournisseurs/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau Fournisseur
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher (nom, email, tel)..."
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
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Délai livraison</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">Chargement...</TableCell></TableRow>
                        ) : fournisseurs.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Aucun fournisseur</TableCell></TableRow>
                        ) : (
                            fournisseurs.map((f) => (
                                <TableRow key={f.id}>
                                    <TableCell className="font-medium">
                                        <span
                                            className="hover:text-blue-600 hover:underline cursor-pointer"
                                            onClick={() => navigate(`/fournisseurs/${f.id}`)}
                                        >
                                            {f.nom}
                                        </span>
                                    </TableCell>
                                    <TableCell>{f.email || '-'}</TableCell>
                                    <TableCell>{f.telephone || '-'}</TableCell>
                                    <TableCell>{f.delaiLivraison ? `${f.delaiLivraison} jours` : '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/fournisseurs/${f.id}`)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/fournisseurs/${f.id}/edit`)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}>
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
                    Total: <span className="font-medium text-foreground">{pagination.total}</span> fournisseurs
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
