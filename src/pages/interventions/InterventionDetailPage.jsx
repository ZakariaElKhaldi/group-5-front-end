import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox"; // Need to install? No, I haven't. Or use simple input for now.
import { StatusBadge, PriorityBadge } from '@/components/interventions/Badges';
import {
    ArrowLeft,
    Play,
    CheckCircle,
    XCircle,
    FileText,
    Printer,
    UserCheck,
    User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function InterventionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin, isTechnicien } = useAuth();

    const [intervention, setIntervention] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resolution, setResolution] = useState('');
    const [completionDialogOpen, setCompletionDialogOpen] = useState(false);

    const fetchIntervention = async () => {
        try {
            const response = await api.get(`/interventions/${id}`);
            setIntervention(response.data);
            setResolution(response.data.resolution || '');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erreur lors du chargement');
            navigate('/interventions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntervention();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        try {
            if (newStatus === 'Terminee' && !resolution) {
                toast.error('La résolution est requise pour terminer');
                return;
            }

            await api.patch(`/interventions/${id}/status`, { statut: newStatus });

            // If completing, also save resolution if provided (api might handle this or separate call? 
            // The status endpoint doesn't accept resolution. I need to update it first.)
            if (newStatus === 'Terminee') {
                await api.put(`/interventions/${id}`, { resolution });
            }

            toast.success(`Statut mis à jour: ${newStatus}`);
            fetchIntervention();
            setCompletionDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Erreur lors du changement de statut');
        }
    };

    const handleConfirmTech = async () => {
        try {
            await api.patch(`/interventions/${id}/confirm-tech`);
            toast.success('Signature technicien validée');
            fetchIntervention();
        } catch (error) {
            toast.error('Erreur lors de la confirmation');
        }
    };

    const handleConfirmClient = async () => {
        try {
            await api.patch(`/interventions/${id}/confirm-client`);
            toast.success('Signature client validée');
            fetchIntervention();
        } catch (error) {
            toast.error('Erreur lors de la confirmation');
        }
    };

    if (loading || !intervention) return <div>Chargement...</div>;

    const canEdit = isAdmin() || (isTechnicien() && intervention.statut !== 'Terminee' && intervention.statut !== 'Annulee');
    const isAssignedTech = user && intervention.technicien?.user?.email === user.email;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/interventions')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            Intervention #{intervention.id}
                            <StatusBadge status={intervention.statut} />
                        </h1>
                        <span className="text-muted-foreground text-sm">
                            Créée le {format(new Date(intervention.dateDebut), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {canEdit && (
                        <Button variant="outline" onClick={() => navigate(`/interventions/${id}/edit`)}>
                            Modifier
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimer
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => window.open(`${import.meta.env.VITE_API_URL}/invoices/intervention/${id}/download`, '_blank')}
                    >
                        <FileText className="mr-2 h-4 w-4" /> Télécharger Facture
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Détails</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground">Description</h3>
                                <p className="mt-1 whitespace-pre-wrap">{intervention.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground">Type</h3>
                                    <p className="capitalize">{intervention.type}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground">Priorité</h3>
                                    <PriorityBadge priority={intervention.priorite} />
                                </div>
                            </div>

                            {intervention.resolution && (
                                <div className="bg-slate-50 p-4 rounded-md border text-sm">
                                    <h3 className="font-semibold text-slate-900 mb-1">Résolution</h3>
                                    <p className="text-slate-700 whitespace-pre-wrap">{intervention.resolution}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Workflow Actions */}
                    {intervention.statut !== 'Annulee' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Workflow</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4">
                                    {/* EN ATTENTE -> EN COURS */}
                                    {intervention.statut === 'En attente' && (
                                        <Button onClick={() => handleStatusChange('En cours')}>
                                            <Play className="mr-2 h-4 w-4" /> Commencer l'intervention
                                        </Button>
                                    )}

                                    {/* EN COURS -> TERMINEE */}
                                    {intervention.statut === 'En cours' && (
                                        <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Terminer l'intervention
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Terminer l'intervention</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Résolution du problème</label>
                                                        <Textarea
                                                            placeholder="Décrivez comment le problème a été résolu..."
                                                            value={resolution}
                                                            onChange={(e) => setResolution(e.target.value)}
                                                            rows={5}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground text-amber-600">
                                                        Attention: Cette action calculera automatiquement les coûts finaux.
                                                    </p>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setCompletionDialogOpen(false)}>Annuler</Button>
                                                    <Button onClick={() => handleStatusChange('Terminee')}>Confirmer la fin</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}

                                    {/* CANCEL */}
                                    {intervention.statut !== 'Terminee' && (
                                        <Button variant="destructive" onClick={() => handleStatusChange('Annulee')}>
                                            <XCircle className="mr-2 h-4 w-4" /> Annuler
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Confirmations Section (Only when Done) */}
                    {intervention.statut === 'Terminee' && (
                        <Card>
                            <CardHeader><CardTitle>Validations</CardTitle></CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-slate-500" />
                                        <div>
                                            <p className="font-medium">Technicien</p>
                                            {intervention.confirmationTechnicien ? (
                                                <span className="text-xs text-green-600 flex items-center">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Signé le {format(new Date(intervention.confirmationTechnicienAt), 'dd/MM/yyyy HH:mm')}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-600">En attente de signature</span>
                                            )}
                                        </div>
                                    </div>
                                    {!intervention.confirmationTechnicien && (isTechnicien() || isAdmin()) && (
                                        <Button size="sm" onClick={handleConfirmTech}>Signer</Button>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <UserCheck className="h-5 w-5 text-slate-500" />
                                        <div>
                                            <p className="font-medium">Client</p>
                                            {intervention.confirmationClient ? (
                                                <span className="text-xs text-green-600 flex items-center">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Validé le {format(new Date(intervention.confirmationClientAt), 'dd/MM/yyyy HH:mm')}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-600">En attente de validation</span>
                                            )}
                                        </div>
                                    </div>
                                    {!intervention.confirmationClient && isAdmin() && (
                                        <Button size="sm" onClick={handleConfirmClient}>Valider</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Machine Concernée</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Modèle:</span>
                                <span className="font-medium">{intervention.machine?.modele}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Réf:</span>
                                <span>{intervention.machine?.reference}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Statut:</span>
                                <Badge variant="outline">{intervention.machine?.statut}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Technicien</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            {intervention.technicien ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Nom:</span>
                                        <span className="font-medium">{intervention.technicien.user?.nom} {intervention.technicien.user?.prenom}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Spécialité:</span>
                                        <span>{intervention.technicien.specialite}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-muted-foreground italic">Aucun technicien assigné</div>
                            )}
                        </CardContent>
                    </Card>

                    {intervention.statut === 'Terminee' && (
                        <Card>
                            <CardHeader><CardTitle className="text-base">Coûts</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Temps passé:</span>
                                    <span>{intervention.dureeReelle ? (intervention.dureeReelle / 60).toFixed(1) + ' h' : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Coût Pièces:</span>
                                    <span>{intervention.coutPieces} €</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>{intervention.coutTotal} €</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
