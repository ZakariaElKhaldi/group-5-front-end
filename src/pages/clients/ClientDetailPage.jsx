import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    FileText,
    Settings2,
    AlertTriangle,
    Wrench,
    Edit,
    MessageCircle,
    Loader2,
    ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ClientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [machines, setMachines] = useState([]);
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch client details
                const clientRes = await api.get(`/clients/${id}`);
                setClient(clientRes.data);

                // Fetch client's machines
                const machinesRes = await api.get('/machines?limit=100');
                const clientMachines = (machinesRes.data.items || []).filter(
                    m => m.client?.id === parseInt(id)
                );
                setMachines(clientMachines);

                // Fetch workorders for this client's machines
                const workordersRes = await api.get('/workorders?limit=100');
                const machineIds = clientMachines.map(m => m.id);
                const clientWorkorders = (workordersRes.data.items || []).filter(
                    wo => machineIds.includes(wo.machine?.id)
                ).map(wo => ({
                    id: wo.id,
                    dateDebut: wo.dateReported,
                    type: wo.type,
                    statut: wo.status === 'completed' ? 'Terminee' :
                        wo.status === 'in_progress' ? 'En cours' :
                            wo.status === 'assigned' ? 'Assignée' : 'En attente',
                    machine: wo.machine,
                    coutTotal: wo.estimatedCost || 0,
                }));
                setInterventions(clientWorkorders.slice(0, 10)); // Last 10

            } catch (error) {
                console.error('Error loading client:', error);
                toast.error('Erreur lors du chargement du client');
                navigate('/clients');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const formatPhoneForWhatsApp = (phone) => {
        if (!phone) return null;
        let cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '212' + cleaned.substring(1);
        }
        return cleaned;
    };

    const getStatusBadge = (statut) => {
        const styles = {
            'En service': 'bg-green-100 text-green-700',
            'En maintenance': 'bg-amber-100 text-amber-700',
            'En panne': 'bg-red-100 text-red-700',
            'Hors service': 'bg-gray-100 text-gray-700',
        };
        return <Badge className={styles[statut] || 'bg-gray-100'}>{statut}</Badge>;
    };

    const getInterventionStatusBadge = (statut) => {
        const styles = {
            'En attente': 'bg-blue-100 text-blue-700',
            'En cours': 'bg-amber-100 text-amber-700',
            'Terminee': 'bg-green-100 text-green-700',
            'Annulee': 'bg-gray-100 text-gray-700',
        };
        return <Badge className={styles[statut] || 'bg-gray-100'}>{statut}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!client) {
        return null;
    }

    const whatsappPhone = formatPhoneForWhatsApp(client.telephone);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-blue-500" />
                            {client.nom}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Client #{client.id} • {machines.length} machine(s)
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {whatsappPhone && (
                        <Button
                            variant="outline"
                            onClick={() => window.open(`https://wa.me/${whatsappPhone}`, '_blank')}
                        >
                            <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                            WhatsApp
                        </Button>
                    )}
                    <Button onClick={() => navigate(`/clients/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Client Info */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informations de Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {client.email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                                            {client.email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {client.telephone && (
                                <div className="flex items-start gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Téléphone</p>
                                        <a href={`tel:${client.telephone}`} className="hover:underline">
                                            {client.telephone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {client.adresse && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Adresse</p>
                                        <p>{client.adresse}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Legal Info */}
                    {(client.ice || client.rc || client.patente) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-amber-500" />
                                    Informations Légales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {client.ice && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">ICE</p>
                                        <p className="font-mono">{client.ice}</p>
                                    </div>
                                )}
                                {client.rc && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Registre du Commerce</p>
                                        <p className="font-mono">{client.rc}</p>
                                    </div>
                                )}
                                {client.patente && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Patente</p>
                                        <p className="font-mono">{client.patente}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{machines.length}</p>
                                <p className="text-xs text-muted-foreground">Machines</p>
                            </div>
                            <div className="text-center p-3 bg-amber-50 rounded-lg">
                                <p className="text-2xl font-bold text-amber-600">{interventions.length}</p>
                                <p className="text-xs text-muted-foreground">Interventions</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                <p className="text-2xl font-bold text-red-600">
                                    {machines.filter(m => m.statut === 'En panne').length}
                                </p>
                                <p className="text-xs text-muted-foreground">En panne</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">
                                    {machines.filter(m => m.statut === 'En service').length}
                                </p>
                                <p className="text-xs text-muted-foreground">En service</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Machines and Interventions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Machines List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-slate-500" />
                                Machines ({machines.length})
                            </CardTitle>
                            <CardDescription>
                                Équipements associés à ce client
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {machines.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Aucune machine enregistrée</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Référence</TableHead>
                                            <TableHead>Modèle</TableHead>
                                            <TableHead>Emplacement</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {machines.map((machine) => (
                                            <TableRow key={machine.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {machine.reference}
                                                </TableCell>
                                                <TableCell>{machine.modele}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {machine.emplacement || '-'}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(machine.statut)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/machines/${machine.id}`)}
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Interventions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-amber-500" />
                                Dernières Interventions
                            </CardTitle>
                            <CardDescription>
                                Historique des interventions sur les machines du client
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {interventions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Aucune intervention enregistrée</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Machine</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Coût</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {interventions.map((intervention) => (
                                            <TableRow key={intervention.id}>
                                                <TableCell>
                                                    {intervention.dateDebut
                                                        ? format(new Date(intervention.dateDebut), 'dd/MM/yyyy', { locale: fr })
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {intervention.machine?.reference}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={intervention.type === 'corrective' ? 'destructive' : 'secondary'}>
                                                        {intervention.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {getInterventionStatusBadge(intervention.statut)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {intervention.coutTotal?.toFixed(2) || '0.00'} €
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/workorders/${intervention.id}`)}
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
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
            </div>
        </div>
    );
}
