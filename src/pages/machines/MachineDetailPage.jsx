import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, QrCode, Printer, Edit, FileText } from 'lucide-react';
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

    useEffect(() => {
        fetchMachine();
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
        </div>
    );
}

