import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PannesPage() {
    const [pannes, setPannes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPannes = async () => {
        try {
            const response = await api.get('/pannes');
            setPannes(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement pannes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPannes();
    }, []);

    const getGraviteBadge = (gravite) => {
        const colors = {
            'Faible': 'bg-green-100 text-green-800',
            'Moyenne': 'bg-yellow-100 text-yellow-800',
            'Critique': 'bg-red-100 text-red-800',
        };
        return (
            <Badge variant="outline" className={colors[gravite] || ''}>
                {gravite}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Historique des Pannes</h1>
                    <p className="text-muted-foreground">Liste des pannes déclarées</p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Machine</TableHead>
                            <TableHead>Date Déclaration</TableHead>
                            <TableHead>Gravité</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24">Chargement...</TableCell></TableRow>
                        ) : pannes.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Aucune panne répertoriée</TableCell></TableRow>
                        ) : (
                            pannes.map((panne) => (
                                <TableRow key={panne.id}>
                                    <TableCell className="font-medium">
                                        {panne.machine?.modele} <span className="text-muted-foreground text-xs">({panne.machine?.reference})</span>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(panne.dateDeclaration), 'dd MMM yyyy HH:mm', { locale: fr })}
                                    </TableCell>
                                    <TableCell>{getGraviteBadge(panne.gravite)}</TableCell>
                                    <TableCell className="max-w-md truncate" title={panne.description}>
                                        {panne.description}
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
