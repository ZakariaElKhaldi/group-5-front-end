import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, Wrench, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MachineQrCode from '@/components/machines/MachineQrCode';
import MachineImageGallery from '@/components/machines/MachineImageGallery';

export default function MachineDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [workOrders, setWorkOrders] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const fetchMachine = async () => {
        try {
            const response = await api.get(`/machines/${id}`);
            setMachine(response.data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erreur lors du chargement');
            navigate('/machines');
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkOrders = async () => {
        try {
            const response = await api.get(`/machines/${id}/interventions`);
            setWorkOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching work orders:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchMachine();
        fetchWorkOrders();
    }, [id]);

    const getStatusColor = (statut) => {
        const colors = {
            'En service': 'bg-green-100 text-green-700',
            'En panne': 'bg-red-100 text-red-700',
            'En maintenance': 'bg-amber-100 text-amber-700',
            'Hors service': 'bg-gray-100 text-gray-700',
        };
        return colors[statut] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!machine) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/machines')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {machine.reference}
                            <Badge className={getStatusColor(machine.statut)}>{machine.statut}</Badge>
                        </h1>
                        <span className="text-muted-foreground text-sm">
                            {machine.modele} - {machine.marque}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/machines/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Modifier
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Machine Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-muted-foreground">Référence</span>
                                <p className="font-medium">{machine.reference}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Modèle</span>
                                <p className="font-medium">{machine.modele}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Marque</span>
                                <p className="font-medium">{machine.marque || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Type</span>
                                <p className="font-medium">{machine.type || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Date d'acquisition</span>
                                <p className="font-medium">
                                    {machine.dateAcquisition
                                        ? format(new Date(machine.dateAcquisition), 'dd MMM yyyy', { locale: fr })
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Client</span>
                                <p className="font-medium">{machine.client?.nom || 'Non assigné'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code */}
                <MachineQrCode machine={machine} />

                {/* Image Gallery */}
                <div className="md:col-span-2">
                    <MachineImageGallery machine={machine} onUpdate={fetchMachine} />
                </div>
            </div>

            {/* Work Order History Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-amber-500" />
                        Historique des interventions ({workOrders.length})
                    </CardTitle>
                    <CardDescription>
                        Toutes les interventions passées sur cette machine
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : workOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune intervention pour cette machine</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Technicien</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workOrders.map((wo) => (
                                    <TableRow key={wo.id}>
                                        <TableCell>
                                            {wo.dateReported
                                                ? format(new Date(wo.dateReported), 'dd/MM/yyyy', { locale: fr })
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={wo.type === 'corrective' ? 'destructive' : 'secondary'}>
                                                {wo.type === 'corrective' ? 'Corrective' :
                                                    wo.type === 'preventive' ? 'Préventive' : 'Inspection'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                wo.status === 'completed' ? 'bg-green-500' :
                                                    wo.status === 'in_progress' ? 'bg-blue-500' :
                                                        wo.status === 'assigned' ? 'bg-yellow-500 text-black' : 'bg-gray-500'
                                            }>
                                                {wo.status === 'completed' ? 'Terminé' :
                                                    wo.status === 'in_progress' ? 'En cours' :
                                                        wo.status === 'assigned' ? 'Assigné' :
                                                            wo.status === 'reported' ? 'Signalé' : wo.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {wo.technicien?.user?.nom
                                                ? `${wo.technicien.user.nom} ${wo.technicien.user.prenom || ''}`
                                                : <span className="text-muted-foreground italic">Non assigné</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => navigate(`/workorders/${wo.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

