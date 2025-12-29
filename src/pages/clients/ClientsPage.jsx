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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce client ?')) return;
        try {
            await api.delete(`/clients/${id}`);
            setClients(clients.filter(c => c.id !== id));
            toast.success('Client supprimé');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground">Gestion de la clientèle</p>
                </div>
                <Button onClick={() => navigate('/clients/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau Client
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24">Chargement...</TableCell></TableRow>
                        ) : clients.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Aucun client</TableCell></TableRow>
                        ) : (
                            clients.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.nom}</TableCell>
                                    <TableCell>{c.email || '-'}</TableCell>
                                    <TableCell>{c.telephone || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${c.id}/edit`)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
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
