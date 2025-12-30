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
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FournisseursPage() {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchFournisseurs = async () => {
        try {
            const response = await api.get('/fournisseurs');
            setFournisseurs(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement fournisseurs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFournisseurs();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) return;
        try {
            await api.delete(`/fournisseurs/${id}`);
            setFournisseurs(fournisseurs.filter(f => f.id !== id));
            toast.success('Fournisseur supprimé');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Truck className="h-8 w-8 text-amber-500" />
                        Fournisseurs
                    </h1>
                    <p className="text-muted-foreground">Gestion des fournisseurs de pièces</p>
                </div>
                <Button onClick={() => navigate('/fournisseurs/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau Fournisseur
                </Button>
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
                                    <TableCell className="font-medium">{f.nom}</TableCell>
                                    <TableCell>{f.email || '-'}</TableCell>
                                    <TableCell>{f.telephone || '-'}</TableCell>
                                    <TableCell>{f.delaiLivraison ? `${f.delaiLivraison} jours` : '-'}</TableCell>
                                    <TableCell className="text-right">
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
        </div>
    );
}
