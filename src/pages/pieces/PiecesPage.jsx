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

export default function PiecesPage() {
    const [pieces, setPieces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);
    const navigate = useNavigate();

    const fetchPieces = async () => {
        try {
            const url = showLowStock ? '/pieces/low-stock' : `/pieces${search ? `?search=${search}` : ''}`;
            const response = await api.get(url);
            setPieces(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement pièces');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPieces();
    }, [showLowStock]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPieces();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette pièce ?')) return;
        try {
            await api.delete(`/pieces/${id}`);
            setPieces(pieces.filter(p => p.id !== id));
            toast.success('Pièce supprimée');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
        }
    };

    const lowStockCount = pieces.filter(p => p.isLowStock).length;

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
                <Button onClick={() => navigate('/pieces/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle Pièce
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                    <Input
                        placeholder="Rechercher par référence ou nom..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="secondary">
                        <Search className="h-4 w-4" />
                    </Button>
                </form>
                <Button
                    variant={showLowStock ? "destructive" : "outline"}
                    onClick={() => setShowLowStock(!showLowStock)}
                >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Stock faible {lowStockCount > 0 && `(${lowStockCount})`}
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
                            <TableHead className="text-right">Actions</TableHead>
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
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/pieces/${piece.id}/edit`)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(piece.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
