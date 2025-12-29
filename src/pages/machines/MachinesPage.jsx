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
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchMachines = async () => {
        try {
            const response = await api.get('/machines');
            setMachines(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
                    <p className="text-muted-foreground">Gestion du parc machine</p>
                </div>
                <Button onClick={() => navigate('/machines/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle Machine
                </Button>
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
                                    <TableCell>{m.dateAchat ? new Date(m.dateAchat).toLocaleDateString('fr-FR') : '-'}</TableCell>
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
        </div>
    );
}
