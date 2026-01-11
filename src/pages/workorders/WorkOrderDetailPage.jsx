import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft, Edit, Loader2, Clock, Calendar, User,
    Wrench, AlertTriangle, CheckCircle, XCircle, PlayCircle,
    UserPlus, PenTool
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TechnicianAssignDialog } from '@/components/workorders/TechnicianAssignDialog';
import { SignatureModal } from '@/components/workorders/SignatureModal';

// Status configuration
const STATUS_CONFIG = {
    reported: { label: 'Signalé', icon: AlertTriangle, color: 'bg-yellow-500', next: ['assigned', 'cancelled'] },
    assigned: { label: 'Assigné', icon: User, color: 'bg-blue-500', next: ['in_progress', 'cancelled'] },
    in_progress: { label: 'En cours', icon: PlayCircle, color: 'bg-purple-500', next: ['completed', 'cancelled'] },
    completed: { label: 'Terminé', icon: CheckCircle, color: 'bg-green-500', next: [] },
    cancelled: { label: 'Annulé', icon: XCircle, color: 'bg-red-500', next: [] },
};

export default function WorkOrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isTechnicien, getTechnicienId } = useAuth();

    const [workOrder, setWorkOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    useEffect(() => {
        fetchWorkOrder();
    }, [id]);

    const fetchWorkOrder = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/workorders/${id}`);
            setWorkOrder(response.data);
        } catch (error) {
            console.error('Error fetching work order:', error);
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await api.put(`/workorders/${id}/status`, { status: newStatus });
            toast.success(`Statut changé: ${STATUS_CONFIG[newStatus]?.label}`);
            fetchWorkOrder();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
        } finally {
            setUpdating(false);
        }
    };

    const handleAccept = async () => {
        setUpdating(true);
        try {
            const techId = getTechnicienId();
            await api.put(`/workorders/${id}`, { technicienId: techId });
            await api.patch(`/workorders/${id}/status`, { status: 'assigned' });
            toast.success('Ordre accepté');
            fetchWorkOrder();
        } catch (error) {
            console.error('Error accepting:', error);
            toast.error('Erreur lors de l\'acceptation');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!workOrder) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Ordre de travail non trouvé</p>
                <Button className="mt-4" onClick={() => navigate('/workorders')}>
                    Retour à la liste
                </Button>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[workOrder.status] || {};
    const StatusIcon = statusConfig.icon || AlertTriangle;
    const canEdit = isAdmin() || (isTechnicien() && workOrder.technicienId === getTechnicienId());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/workorders')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            Ordre #{workOrder.id}
                            <Badge className={`${statusConfig.color} ml-2`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">
                            Créé le {format(new Date(workOrder.dateReported), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {workOrder.status === 'completed' && (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                try {
                                    const response = await api.get(`/workorders/${id}/invoice`, {
                                        responseType: 'blob'
                                    });
                                    const blob = new Blob([response.data], { type: 'application/pdf' });
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `facture_${id.toString().padStart(6, '0')}.pdf`;
                                    link.click();
                                    window.URL.revokeObjectURL(url);
                                    toast.success('Facture téléchargée');
                                } catch (error) {
                                    console.error('Invoice download error:', error);
                                    toast.error('Erreur lors du téléchargement');
                                }
                            }}
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Télécharger Facture
                        </Button>
                    )}
                    {canEdit && (
                        <Button onClick={() => navigate(`/workorders/${id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" /> Modifier
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Actions */}
            {(statusConfig.next?.length > 0 || isAdmin()) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2 flex-wrap">
                        {/* Admin can assign technician */}
                        {isAdmin() && !workOrder.technicienId && workOrder.status === 'reported' && (
                            <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assigner un technicien
                            </Button>
                        )}

                        {/* Technician can accept unassigned orders */}
                        {workOrder.status === 'reported' && isTechnicien() && !workOrder.technicienId && (
                            <Button onClick={handleAccept} disabled={updating}>
                                {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Accepter cet ordre
                            </Button>
                        )}

                        {/* Status transitions */}
                        {statusConfig.next?.map(nextStatus => (
                            <Button key={nextStatus}
                                variant={nextStatus === 'cancelled' ? 'destructive' : 'default'}
                                onClick={() => handleStatusChange(nextStatus)}
                                disabled={updating}>
                                {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {STATUS_CONFIG[nextStatus]?.label}
                            </Button>
                        ))}

                        {/* Client signature for completed work orders */}
                        {workOrder.status === 'completed' && !workOrder.signatureClient && (
                            <Button variant="outline" onClick={() => setShowSignatureModal(true)}>
                                <PenTool className="h-4 w-4 mr-2" />
                                Recueillir signature client
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Détails</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="outline">
                                {workOrder.type === 'corrective' ? 'Corrective' :
                                    workOrder.type === 'preventive' ? 'Préventive' : 'Inspection'}
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Priorité</span>
                            <Badge variant="outline" className={
                                workOrder.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    workOrder.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''
                            }>
                                {workOrder.priority === 'urgent' ? 'Urgente' :
                                    workOrder.priority === 'high' ? 'Haute' :
                                        workOrder.priority === 'normal' ? 'Normale' : 'Basse'}
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Origine</span>
                            <span>{workOrder.origin === 'breakdown' ? 'Panne' :
                                workOrder.origin === 'scheduled' ? 'Planifié' : 'Demande'}</span>
                        </div>
                        {workOrder.estimatedDuration && (
                            <>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-4 w-4" /> Durée estimée
                                    </span>
                                    <span>{workOrder.estimatedDuration} min</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Machine */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" /> Machine
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {workOrder.machine ? (
                            <div className="space-y-2">
                                <p className="font-medium text-lg">{workOrder.machine.modele}</p>
                                <p className="text-muted-foreground">{workOrder.machine.reference}</p>
                                <Button variant="outline" size="sm"
                                    onClick={() => navigate(`/machines/${workOrder.machineId}`)}>
                                    Voir la machine
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Machine non spécifiée</p>
                        )}
                    </CardContent>
                </Card>

                {/* Technician */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Technicien
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {workOrder.technicien ? (
                            <div className="space-y-2">
                                <p className="font-medium text-lg">
                                    {workOrder.technicien.user?.nom} {workOrder.technicien.user?.prenom}
                                </p>
                                <p className="text-muted-foreground">{workOrder.technicien.specialite}</p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">Non assigné</p>
                        )}
                    </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" /> Chronologie
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Signalé</span>
                            <span>{format(new Date(workOrder.dateReported), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                        {workOrder.dateStarted && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Démarré</span>
                                <span>{format(new Date(workOrder.dateStarted), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                        )}
                        {workOrder.dateCompleted && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Terminé</span>
                                <span>{format(new Date(workOrder.dateCompleted), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{workOrder.description || 'Aucune description'}</p>
                </CardContent>
            </Card>

            {/* Resolution (if completed) */}
            {workOrder.resolution && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" /> Résolution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{workOrder.resolution}</p>
                    </CardContent>
                </Card>
            )}

            {/* Signature Display (if signed) */}
            {workOrder.signatureClient && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-600">
                            <PenTool className="h-5 w-5" /> Signature Client
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Signé par: <span className="font-medium text-foreground">{workOrder.signerName || 'Client'}</span>
                        </p>
                        {workOrder.signatureClientAt && (
                            <p className="text-sm text-muted-foreground">
                                Le {format(new Date(workOrder.signatureClientAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </p>
                        )}
                        <div className="border rounded p-2 bg-white">
                            <img src={workOrder.signatureClient} alt="Signature" className="max-w-[200px]" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Dialogs */}
            <TechnicianAssignDialog
                workOrderId={id}
                currentTechnicienId={workOrder.technicienId}
                open={showAssignDialog}
                onOpenChange={setShowAssignDialog}
                onAssigned={fetchWorkOrder}
            />

            <SignatureModal
                workOrderId={id}
                open={showSignatureModal}
                onOpenChange={setShowSignatureModal}
                onSigned={fetchWorkOrder}
            />
        </div>
    );
}
