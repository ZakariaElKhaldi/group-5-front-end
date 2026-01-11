import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, AlertTriangle, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function PiecesPage() {
    const [pieces, setPieces] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });
    const [showLowStock, setShowLowStock] = useState(false);
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const fetchPieces = async () => {
        setLoading(true);
        try {
            if (showLowStock) {
                const response = await api.get('/pieces/low-stock');
                setPieces(response.data);
                setPagination({ total: response.data.length, page: 1, totalPages: 1 });
            } else {
                const params = new URLSearchParams({
                    page: filters.page,
                    limit: filters.limit,
                    search: filters.search
                });
                const response = await api.get(`/pieces?${params.toString()}`);
                setPieces(response.data.items || []);
                setPagination({
                    total: response.data.total,
                    page: response.data.page,
                    totalPages: response.data.totalPages
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement pièces');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchPieces(), 300);
        return () => clearTimeout(timer);
    }, [filters, showLowStock]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette pièce ?')) return;
        try {
            await api.delete(`/pieces/${id}`);
            fetchPieces();
            toast.success('Pièce supprimée');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Package className="h-8 w-8 text-amber-500" />
                        Pièces détachées
                    </h1>
                    <p className="text-muted-foreground">Gestion de l'inventaire des pièces</p>
                </div>
                {isAdmin() && (
                    <Button onClick={() => navigate('/pieces/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Nouvelle Pièce
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par référence ou nom..."
                        className="pl-8"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        disabled={showLowStock}
                    />
                </div>
                <Button
                    variant={showLowStock ? "destructive" : "outline"}
                    onClick={() => setShowLowStock(!showLowStock)}
                >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Stock faible
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Fournisseur</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                            <TableHead className="text-right">Prix unitaire</TableHead>
                            <TableHead>Emplacement</TableHead>
                            {isAdmin() && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center h-24">Chargement...</TableCell></TableRow>
                        ) : pieces.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">Aucune pièce</TableCell></TableRow>
                        ) : (
                            pieces.map((piece) => (
                                <TableRow key={piece.id} className={piece.isLowStock ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                                    <TableCell className="font-mono font-medium">{piece.reference}</TableCell>
                                    <TableCell>{piece.nom}</TableCell>
                                    <TableCell>{piece.fournisseur?.nom || '-'}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={piece.isLowStock ? "destructive" : "secondary"}>
                                            {piece.quantiteStock}
                                        </Badge>
                                        {piece.isLowStock && (
                                            <AlertTriangle className="inline-block ml-1 h-4 w-4 text-red-500" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">{piece.prixUnitaire?.toFixed(2)} €</TableCell>
                                    <TableCell>{piece.emplacement || '-'}</TableCell>
                                    {isAdmin() && (
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/pieces/${piece.id}/edit`)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(piece.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!showLowStock && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Total: <span className="font-medium text-foreground">{pagination.total}</span> pièces
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
            )}
        </div>
    );
}
