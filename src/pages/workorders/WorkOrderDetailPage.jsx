import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft, Edit, Loader2, Clock, Calendar, User, FileText, Download,
    Wrench, AlertTriangle, CheckCircle, XCircle, PlayCircle, Settings,
    UserPlus, PenTool, Phone, Mail, MapPin, Building2, Image, Package, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TechnicianAssignDialog } from '@/components/workorders/TechnicianAssignDialog';
import { SignatureModal } from '@/components/workorders/SignatureModal';
import { CompletionDialog } from '@/components/workorders/CompletionDialog';
import { PartsSection } from '@/components/workorders/PartsSection';
import { NotesSection } from '@/components/workorders/NotesSection';

// Status configuration with improved visuals
const STATUS_CONFIG = {
    reported: { label: 'Signalé', icon: AlertTriangle, color: 'bg-amber-500', textColor: 'text-amber-600', step: 1 },
    assigned: { label: 'Assigné', icon: User, color: 'bg-blue-500', textColor: 'text-blue-600', step: 2 },
    in_progress: { label: 'En cours', icon: PlayCircle, color: 'bg-purple-500', textColor: 'text-purple-600', step: 3 },
    completed: { label: 'Terminé', icon: CheckCircle, color: 'bg-green-500', textColor: 'text-green-600', step: 4 },
    cancelled: { label: 'Annulé', icon: XCircle, color: 'bg-red-500', textColor: 'text-red-600', step: 0 },
};

const PRIORITY_CONFIG = {
    low: { label: 'Basse', color: 'bg-slate-100 text-slate-700' },
    medium: { label: 'Normale', color: 'bg-blue-100 text-blue-700' },
    high: { label: 'Haute', color: 'bg-orange-100 text-orange-700' },
    critical: { label: 'Critique', color: 'bg-red-100 text-red-700' },
};

const TYPE_CONFIG = {
    corrective: { label: 'Corrective', color: 'bg-red-50 text-red-700 border-red-200' },
    preventive: { label: 'Préventive', color: 'bg-green-50 text-green-700 border-green-200' },
    inspection: { label: 'Inspection', color: 'bg-blue-50 text-blue-700 border-blue-200' },
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
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

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

    const handleComplete = async (completionData) => {
        setUpdating(true);
        try {
            await api.put(`/workorders/${id}`, {
                resolution: completionData.resolution,
                actualDuration: completionData.actualDuration,
                laborCost: completionData.laborCost,
                partsCost: completionData.partsCost,
            });
            await api.put(`/workorders/${id}/status`, { status: 'completed' });
            toast.success('Intervention terminée avec succès!');
            fetchWorkOrder();
        } catch (error) {
            console.error('Error completing work order:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la complétion');
            throw error;
        } finally {
            setUpdating(false);
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            const response = await api.get(`/workorders/${id}/invoice`, { responseType: 'blob' });
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
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Chargement de l'ordre...</p>
                </div>
            </div>
        );
    }

    if (!workOrder) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Ordre de travail non trouvé</h2>
                <p className="text-muted-foreground mb-4">L'ordre demandé n'existe pas ou a été supprimé.</p>
                <Button onClick={() => navigate('/workorders')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
                </Button>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[workOrder.status] || STATUS_CONFIG.reported;
    const StatusIcon = statusConfig.icon;
    const priorityConfig = PRIORITY_CONFIG[workOrder.priority] || PRIORITY_CONFIG.medium;
    const typeConfig = TYPE_CONFIG[workOrder.type] || TYPE_CONFIG.corrective;
    const canEdit = isAdmin() || (isTechnicien() && workOrder.technicienId === getTechnicienId());
    const canModifyParts = isAdmin() || (isTechnicien() && workOrder.technicienId === getTechnicienId() && ['assigned', 'in_progress'].includes(workOrder.status));

    // Progress steps for timeline
    const progressSteps = [
        { key: 'reported', label: 'Signalé', date: workOrder.dateReported },
        { key: 'assigned', label: 'Assigné', date: workOrder.dateReported },
        { key: 'in_progress', label: 'En cours', date: workOrder.dateStarted },
        { key: 'completed', label: 'Terminé', date: workOrder.dateCompleted },
    ];

    return (
        <div className="space-y-6 pb-8">
            {/* Compact Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/workorders')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold">Ordre #{workOrder.id}</h1>
                        <Badge className={`${statusConfig.color} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                        </Badge>
                        <Badge variant="outline" className={typeConfig.color}>
                            {typeConfig.label}
                        </Badge>
                        <Badge variant="outline" className={priorityConfig.color}>
                            {priorityConfig.label}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Créé le {format(new Date(workOrder.dateReported), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                </div>
            </div>

            {/* Quick Info Bar */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-none shadow-sm">
                <CardContent className="py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Machine */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                <Wrench className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Machine</p>
                                <p className="font-medium truncate">{workOrder.machine?.modele || 'N/A'}</p>
                            </div>
                        </div>
                        {/* Client */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                <Building2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Client</p>
                                <p className="font-medium truncate">{workOrder.machine?.client?.nom || 'N/A'}</p>
                            </div>
                        </div>
                        {/* Technician */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                                <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Technicien</p>
                                <p className="font-medium truncate">
                                    {workOrder.technicien ? `${workOrder.technicien.user?.prenom || ''} ${workOrder.technicien.user?.nom || ''}`.trim() : 'Non assigné'}
                                </p>
                            </div>
                        </div>
                        {/* Duration */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Durée</p>
                                <p className="font-medium">
                                    {workOrder.actualDuration ? `${workOrder.actualDuration} min` : workOrder.estimatedDuration ? `~${workOrder.estimatedDuration} min` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                {/* Admin assign */}
                {isAdmin() && !workOrder.technicienId && workOrder.status === 'reported' && (
                    <Button variant="outline" onClick={() => setShowAssignDialog(true)}>
                        <UserPlus className="h-4 w-4 mr-2" /> Assigner
                    </Button>
                )}

                {/* Status transitions */}
                {statusConfig.next?.includes('in_progress') && (
                    <Button onClick={() => handleStatusChange('in_progress')} disabled={updating}>
                        {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <PlayCircle className="h-4 w-4 mr-2" /> Démarrer
                    </Button>
                )}
                {statusConfig.next?.includes('completed') && (
                    <Button onClick={() => setShowCompletionDialog(true)} disabled={updating} className="bg-green-600 hover:bg-green-700">
                        {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <CheckCircle className="h-4 w-4 mr-2" /> Terminer
                    </Button>
                )}
                {statusConfig.next?.includes('cancelled') && (
                    <Button variant="destructive" onClick={() => handleStatusChange('cancelled')} disabled={updating}>
                        <XCircle className="h-4 w-4 mr-2" /> Annuler
                    </Button>
                )}

                {/* Signature */}
                {workOrder.status === 'completed' && !workOrder.signatureClient && (
                    <Button variant="outline" onClick={() => setShowSignatureModal(true)}>
                        <PenTool className="h-4 w-4 mr-2" /> Signature client
                    </Button>
                )}

                {/* Invoice */}
                {workOrder.status === 'completed' && (
                    <Button variant="outline" onClick={handleDownloadInvoice}>
                        <Download className="h-4 w-4 mr-2" /> Facture
                    </Button>
                )}

                {/* Edit */}
                {canEdit && (
                    <Button variant="ghost" onClick={() => navigate(`/workorders/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" /> Modifier
                    </Button>
                )}
            </div>

            {/* Tabs for organized content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="overview" className="gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Détails</span>
                    </TabsTrigger>
                    <TabsTrigger value="parts" className="gap-2">
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">Pièces</span>
                        {workOrder.workOrderPieces?.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{workOrder.workOrderPieces.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Notes</span>
                    </TabsTrigger>
                    <TabsTrigger value="media" className="gap-2">
                        <Image className="h-4 w-4" />
                        <span className="hidden sm:inline">Photos</span>
                        {workOrder.images?.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{workOrder.images.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Description */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Description du problème</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm">{workOrder.description || 'Aucune description fournie.'}</p>
                            </CardContent>
                        </Card>

                        {/* Machine & Client */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Wrench className="h-4 w-4" /> Machine
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {workOrder.machine ? (
                                    <>
                                        <div>
                                            <p className="font-semibold">{workOrder.machine.modele}</p>
                                            <p className="text-sm text-muted-foreground">{workOrder.machine.reference}</p>
                                            {workOrder.machine.marque && <p className="text-sm text-muted-foreground">{workOrder.machine.marque}</p>}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/machines/${workOrder.machineId}`)}>
                                            Voir la fiche machine
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Machine non spécifiée</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Client Contact */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Building2 className="h-4 w-4" /> Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {workOrder.machine?.client ? (
                                    <>
                                        <p className="font-semibold">{workOrder.machine.client.nom}</p>
                                        {workOrder.machine.client.telephone && (
                                            <a href={`tel:${workOrder.machine.client.telephone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                                                <Phone className="h-4 w-4" /> {workOrder.machine.client.telephone}
                                            </a>
                                        )}
                                        {workOrder.machine.client.email && (
                                            <a href={`mailto:${workOrder.machine.client.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                                                <Mail className="h-4 w-4" /> {workOrder.machine.client.email}
                                            </a>
                                        )}
                                        {workOrder.machine.client.adresse && (
                                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" /> {workOrder.machine.client.adresse}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Client non spécifié</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Chronologie
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Signalé</span>
                                        <span>{format(new Date(workOrder.dateReported), 'dd/MM/yyyy HH:mm')}</span>
                                    </div>
                                    {workOrder.dateStarted && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Démarré</span>
                                            <span>{format(new Date(workOrder.dateStarted), 'dd/MM/yyyy HH:mm')}</span>
                                        </div>
                                    )}
                                    {workOrder.dateCompleted && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Terminé</span>
                                            <span>{format(new Date(workOrder.dateCompleted), 'dd/MM/yyyy HH:mm')}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technician */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" /> Technicien
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {workOrder.technicien ? (
                                    <div>
                                        <p className="font-semibold">{workOrder.technicien.user?.prenom} {workOrder.technicien.user?.nom}</p>
                                        <p className="text-sm text-muted-foreground">{workOrder.technicien.specialite}</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic">Non assigné</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Resolution */}
                        {workOrder.resolution && (
                            <Card className="lg:col-span-2 border-green-200 bg-green-50/50 dark:bg-green-950/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2 text-green-700">
                                        <CheckCircle className="h-4 w-4" /> Résolution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-sm">{workOrder.resolution}</p>
                                    {(workOrder.actualDuration || workOrder.laborCost || workOrder.partsCost) && (
                                        <div className="mt-4 pt-4 border-t border-green-200 grid grid-cols-3 gap-4 text-sm">
                                            {workOrder.actualDuration && (
                                                <div>
                                                    <span className="text-muted-foreground">Durée réelle</span>
                                                    <p className="font-medium">{workOrder.actualDuration} min</p>
                                                </div>
                                            )}
                                            {workOrder.laborCost != null && (
                                                <div>
                                                    <span className="text-muted-foreground">Main d'œuvre</span>
                                                    <p className="font-medium">{parseFloat(workOrder.laborCost).toFixed(2)} €</p>
                                                </div>
                                            )}
                                            {workOrder.partsCost != null && (
                                                <div>
                                                    <span className="text-muted-foreground">Pièces</span>
                                                    <p className="font-medium">{parseFloat(workOrder.partsCost).toFixed(2)} €</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Signature */}
                        {workOrder.signatureClient && (
                            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                                        <PenTool className="h-4 w-4" /> Signature Client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Signé par <span className="font-medium text-foreground">{workOrder.signerName || 'Client'}</span>
                                        {workOrder.signatureClientAt && ` le ${format(new Date(workOrder.signatureClientAt), 'dd/MM/yyyy à HH:mm')}`}
                                    </p>
                                    <div className="inline-block border rounded p-2 bg-white">
                                        <img src={workOrder.signatureClient} alt="Signature" className="max-h-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* Parts Tab */}
                <TabsContent value="parts">
                    <PartsSection
                        workOrderId={id}
                        workOrderPieces={workOrder.workOrderPieces || []}
                        onUpdate={fetchWorkOrder}
                        canEdit={canModifyParts}
                    />
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes">
                    <NotesSection workOrderId={id} canEdit={canModifyParts} />
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="space-y-4">
                    {workOrder.images && workOrder.images.length > 0 ? (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Photos ({workOrder.images.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {workOrder.images.map((imageUrl, index) => (
                                        <a
                                            key={index}
                                            href={imageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-square overflow-hidden rounded-lg border hover:border-primary transition-all hover:shadow-lg"
                                        >
                                            <img src={imageUrl} alt={`Photo ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Agrandir</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Image className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">Aucune photo pour cet ordre de travail</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

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
            <CompletionDialog
                open={showCompletionDialog}
                onOpenChange={setShowCompletionDialog}
                workOrder={workOrder}
                onComplete={handleComplete}
            />
        </div>
    );
}
