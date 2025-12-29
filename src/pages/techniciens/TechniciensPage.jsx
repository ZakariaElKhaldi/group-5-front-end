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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TechniciensPage() {
    const [techniciens, setTechniciens] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTechniciens = async () => {
        try {
            const response = await api.get('/techniciens');
            setTechniciens(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement techniciens');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechniciens();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce technicien ?')) return;
        try {
            await api.delete(`/techniciens/${id}`);
            setTechniciens(techniciens.filter(t => t.id !== id));
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
                                    <TableCell className="font-medium">{t.user?.nom} {t.user?.prenom}</TableCell>
                                    <TableCell>{t.user?.email}</TableCell>
                                    <TableCell>{t.specialite}</TableCell>
                                    <TableCell>{t.tauxHoraire} €/h</TableCell>
                                    <TableCell>
                                        <Badge variant={t.statut === 'Disponible' ? 'secondary' : 'outline'} className={t.statut === 'Disponible' ? 'bg-green-100 text-green-800' : ''}>
                                            {t.statut}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
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
        </div>
    );
}
