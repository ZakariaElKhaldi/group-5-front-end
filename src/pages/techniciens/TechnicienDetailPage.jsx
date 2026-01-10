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
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Briefcase,
    Wrench,
    Clock,
    Euro,
    Edit,
    Loader2,
    ExternalLink,
    CheckCircle,
    AlertTriangle,
    FileDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TechnicienDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [technicien, setTechnicien] = useState(null);
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || id === 'undefined') {
            setLoading(false);
            navigate('/techniciens');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch technician details
                const techRes = await api.get(`/techniciens/${id}`);
                setTechnicien(techRes.data);

                // Fetch workorders assigned to this technician (uses the new endpoint)
                const intRes = await api.get(`/techniciens/${id}/workorders`);
                setInterventions(intRes.data || []);

            } catch (error) {
                console.error('Error loading technician:', error);
                toast.error('Erreur lors du chargement du technicien');
                navigate('/techniciens');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const getStatusBadge = (statut) => {
        const styles = {
            'Disponible': 'bg-green-100 text-green-700',
            'En intervention': 'bg-amber-100 text-amber-700',
            'Indisponible': 'bg-red-100 text-red-700',
            'Congé': 'bg-blue-100 text-blue-700',
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

    // Calculate statistics
    const stats = {
        total: interventions.length,
        completed: interventions.filter(i => i.statut === 'Terminee').length,
        inProgress: interventions.filter(i => i.statut === 'En cours').length,
        pending: interventions.filter(i => i.statut === 'En attente').length,
        totalRevenue: interventions
            .filter(i => i.statut === 'Terminee')
            .reduce((sum, i) => sum + (i.coutTotal || 0), 0),
        totalHours: interventions
            .filter(i => i.statut === 'Terminee')
            .reduce((sum, i) => sum + ((i.dureeReelle || 0) / 60), 0),
    };

    const handleDownloadReport = async () => {
        try {
            const response = await api.get(`/reports/technicien/${id}/pdf`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rapport_technicien_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Rapport téléchargé');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Erreur lors du téléchargement');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!technicien) {
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/techniciens')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <User className="h-6 w-6 text-blue-500" />
                            {technicien.user?.nom} {technicien.user?.prenom}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(technicien.statut)}
                            <span className="text-sm text-muted-foreground">
                                • {technicien.specialite || 'Non spécifié'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadReport}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Exporter Rapport PDF
                    </Button>
                    <Button onClick={() => navigate(`/techniciens/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Technician Info */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informations de Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {technicien.email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <a href={`mailto:${technicien.email}`} className="text-blue-600 hover:underline">
                                            {technicien.email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {technicien.telephone && (
                                <div className="flex items-start gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Téléphone</p>
                                        <a href={`tel:${technicien.telephone}`} className="hover:underline">
                                            {technicien.telephone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Spécialité</p>
                                    <p>{technicien.specialite || 'Non spécifié'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Euro className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Taux Horaire</p>
                                    <p className="font-semibold">{technicien.tauxHoraire?.toFixed(2) || '0.00'} €/h</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                <p className="text-xs text-muted-foreground">Terminées</p>
                            </div>
                            <div className="text-center p-3 bg-amber-50 rounded-lg">
                                <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
                                <p className="text-xs text-muted-foreground">En cours</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
                                <p className="text-xs text-muted-foreground">En attente</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Chiffres</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Euro className="h-5 w-5 text-green-600" />
                                    <span className="text-sm">CA Total</span>
                                </div>
                                <span className="font-bold text-green-600">
                                    {stats.totalRevenue.toFixed(2)} €
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm">Heures Travaillées</span>
                                </div>
                                <span className="font-bold text-blue-600">
                                    {stats.totalHours.toFixed(1)} h
                                </span>
                            </div>
                            {stats.completed > 0 && (
                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-purple-600" />
                                        <span className="text-sm">Taux de Réussite</span>
                                    </div>
                                    <span className="font-bold text-purple-600">
                                        {((stats.completed / stats.total) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Interventions History */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-amber-500" />
                                Historique des Interventions ({interventions.length})
                            </CardTitle>
                            <CardDescription>
                                Toutes les interventions assignées à ce technicien
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {interventions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Aucune intervention assignée</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Machine</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Durée</TableHead>
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
                                                    {intervention.machine?.reference || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={intervention.type === 'corrective' ? 'destructive' : 'secondary'}>
                                                        {intervention.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {intervention.dureeReelle
                                                        ? `${intervention.dureeReelle} min`
                                                        : '-'}
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
