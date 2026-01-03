import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge, PriorityBadge } from '@/components/interventions/Badges';
import InterventionPiecesManager from '@/components/interventions/InterventionPiecesManager';
import {
    ArrowLeft,
    Play,
    CheckCircle,
    XCircle,
    FileText,
    Printer,
    UserCheck,
    User,
    Package,
    Clock,
    MessageSquare,
    Building2,
    Phone,
    MessageCircle,
    Send,
    Loader2,
    Euro,
    Timer,
    Wrench,
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
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [techniciens, setTechniciens] = useState([]);
    const [selectedTechnicien, setSelectedTechnicien] = useState('');

    // Panne editing state
    const [editingPanne, setEditingPanne] = useState(false);
    const [panneDescription, setPanneDescription] = useState('');
    const [panneGravite, setPanneGravite] = useState('');

    const fetchIntervention = async () => {
        // Guard: don't fetch if id is not valid
        if (!id || id === 'undefined') {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get(`/interventions/${id}`);
            setIntervention(response.data);
            setResolution(response.data.resolution || '');

            // Initialize panne editing state
            if (response.data.panne) {
                setPanneDescription(response.data.panne.description || '');
                setPanneGravite(response.data.panne.gravite || 'Moyenne');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erreur lors du chargement');
            navigate('/interventions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && id !== 'undefined') {
            fetchIntervention();
            // Fetch technicians for admin reassignment
            if (isAdmin()) {
                api.get('/techniciens?limit=100').then(res => {
                    setTechniciens(res.data.items || []);
                }).catch(err => console.error(err));
            }
        }
    }, [id, isAdmin]);

    const handleStatusChange = async (newStatus) => {
        try {
            if (newStatus === 'Terminee' && !resolution) {
                toast.error('La résolution est requise pour terminer');
                return;
            }

            await api.patch(`/interventions/${id}/status`, { statut: newStatus });

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

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setAddingNote(true);
        try {
            await api.post(`/interventions/${id}/logs`, {
                message: newNote,
                type: 'comment'
            });
            toast.success('Note ajoutée');
            setNewNote('');
            fetchIntervention();
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de l\'ajout de la note');
        } finally {
            setAddingNote(false);
        }
    };

    const handleReassignTechnicien = async () => {
        if (!selectedTechnicien) {
            toast.error('Veuillez sélectionner un technicien');
            return;
        }

        try {
            await api.put(`/interventions/${id}`, {
                technicienId: parseInt(selectedTechnicien)
            });
            toast.success('Technicien réassigné avec succès');
            fetchIntervention();
            setSelectedTechnicien('');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la réassignation');
        }
    };

    const handleUpdatePanne = async () => {
        if (!intervention.panne) return;

        try {
            await api.put(`/pannes/${intervention.panne.id}`, {
                description: panneDescription,
                gravite: panneGravite
            });
            toast.success('Panne mise à jour avec succès');
            fetchIntervention();
            setEditingPanne(false);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const formatPhoneForWhatsApp = (phone) => {
        if (!phone) return null;
        let cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '212' + cleaned.substring(1);
        }
        return cleaned;
    };

    const getLogIcon = (type) => {
        switch (type) {
            case 'status_change': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'arrival': return <User className="h-4 w-4 text-green-500" />;
            case 'departure': return <User className="h-4 w-4 text-orange-500" />;
            default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading || !intervention) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const canEdit = isAdmin() || (isTechnicien() && intervention.statut !== 'Terminee' && intervention.statut !== 'Annulee');
    const client = intervention.machine?.client;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
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

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description Card */}
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
                                <div className="bg-green-50 p-4 rounded-md border border-green-200 text-sm">
                                    <h3 className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" /> Résolution
                                    </h3>
                                    <p className="text-green-800 whitespace-pre-wrap">{intervention.resolution}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pieces Used Section - Using the new component */}
                    <InterventionPiecesManager
                        interventionId={parseInt(id)}
                        piecesUtilisees={intervention.piecesUtilisees || []}
                        coutPieces={intervention.coutPieces || 0}
                        isEditable={['En attente', 'En cours'].includes(intervention.statut) && (isAdmin() || isTechnicien())}
                        onUpdate={fetchIntervention}
                    />

                    {/* Intervention Logs / Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                                Historique & Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add Note Form */}
                            {(isTechnicien() || isAdmin()) && intervention.statut !== 'Terminee' && intervention.statut !== 'Annulee' && (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ajouter une note ou un commentaire..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                    />
                                    <Button onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
                                        {addingNote ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Timeline */}
                            {intervention.logs && intervention.logs.length > 0 ? (
                                <div className="space-y-3">
                                    {intervention.logs.map((log) => (
                                        <div key={log.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                                            <div className="mt-1">{getLogIcon(log.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">
                                                        {log.user?.nom} {log.user?.prenom}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{log.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Aucune activité enregistrée
                                </p>
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
                                    {intervention.statut === 'En attente' && (
                                        <Button onClick={() => handleStatusChange('En cours')}>
                                            <Play className="mr-2 h-4 w-4" /> Commencer l'intervention
                                        </Button>
                                    )}

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
                                                    <p className="text-xs text-amber-600">
                                                        Attention: Cette action calculera automatiquement les coûts finaux.
                                                    </p>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setCompletionDialogOpen(false)}>Annuler</Button>
                                                    <Button onClick={() => handleStatusChange('Terminee')}>Confirmer</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}

                                    {intervention.statut !== 'Terminee' && (
                                        <Button variant="destructive" onClick={() => handleStatusChange('Annulee')}>
                                            <XCircle className="mr-2 h-4 w-4" /> Annuler
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Confirmations */}
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

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Client Info */}
                    {client && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Building2 className="h-4 w-4" /> Client
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-3">
                                <div>
                                    <p className="font-semibold text-lg">{client.nom}</p>
                                </div>
                                {client.telephone && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Phone className="h-3 w-3" /> {client.telephone}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-600 h-6 px-2"
                                            onClick={() => {
                                                const phone = formatPhoneForWhatsApp(client.telephone);
                                                if (phone) {
                                                    window.open(`https://wa.me/${phone}?text=Bonjour ${client.nom}, concernant l'intervention #${intervention.id}...`, '_blank');
                                                }
                                            }}
                                        >
                                            <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                                        </Button>
                                    </div>
                                )}
                                {client.email && (
                                    <p className="text-muted-foreground">{client.email}</p>
                                )}
                                {client.adresse && (
                                    <p className="text-muted-foreground text-xs">{client.adresse}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Machine Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Wrench className="h-4 w-4" /> Machine Concernée
                            </CardTitle>
                        </CardHeader>
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
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => navigate(`/machines/${intervention.machine?.id}`)}
                            >
                                Voir la machine
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Technician Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4" /> Technicien
                            </CardTitle>
                        </CardHeader>
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
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Taux horaire:</span>
                                        <span>{intervention.tauxHoraireApplique || intervention.technicien.tauxHoraire} €/h</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-muted-foreground italic">Aucun technicien assigné</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Technician Assignment (Admin Only) */}
                    {isAdmin() && ['En attente', 'En cours'].includes(intervention.statut) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" /> Réassigner Technicien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Technicien actuel:</label>
                                    <p className="font-medium">
                                        {intervention.technicien
                                            ? `${intervention.technicien.user?.nom} ${intervention.technicien.user?.prenom}`
                                            : 'Non assigné'
                                        }
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nouveau technicien</label>
                                    <Select value={selectedTechnicien} onValueChange={setSelectedTechnicien}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un technicien" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {techniciens.map(tech => (
                                                <SelectItem key={tech.id} value={tech.id.toString()}>
                                                    {tech.user?.nom} {tech.user?.prenom} - {tech.specialite || 'Généraliste'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleReassignTechnicien}
                                    disabled={!selectedTechnicien}
                                    className="w-full"
                                >
                                    Réassigner
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Editable Panne Card (Technician Only) */}
                    {intervention.panne && isTechnicien() && !isAdmin() && intervention.statut === 'En cours' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Wrench className="h-4 w-4" /> Détails de la Panne (Modifiable)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {editingPanne ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Description</label>
                                            <Textarea
                                                value={panneDescription}
                                                onChange={(e) => setPanneDescription(e.target.value)}
                                                rows={4}
                                                placeholder="Décrivez le problème en détail..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Gravité</label>
                                            <Select value={panneGravite} onValueChange={setPanneGravite}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Faible">Faible</SelectItem>
                                                    <SelectItem value="Moyenne">Moyenne</SelectItem>
                                                    <SelectItem value="Elevee">Élevée</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleUpdatePanne} className="flex-1">
                                                Enregistrer
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingPanne(false);
                                                    setPanneDescription(intervention.panne.description || '');
                                                    setPanneGravite(intervention.panne.gravite || 'Moyenne');
                                                }}
                                            >
                                                Annuler
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm text-muted-foreground">Description:</label>
                                            <p className="text-sm">{intervention.panne.description || 'Aucune description'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-muted-foreground">Gravité:</label>
                                            <Badge variant={intervention.panne.gravite === 'Elevee' ? 'destructive' : 'secondary'}>
                                                {intervention.panne.gravite}
                                            </Badge>
                                        </div>
                                        <Button onClick={() => setEditingPanne(true)} className="w-full">
                                            Modifier les détails
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Cost Breakdown */}
                    <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Euro className="h-4 w-4" /> Détail des Coûts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Timer className="h-3 w-3" /> Durée:
                                </span>
                                <span>{intervention.dureeReelle ? (intervention.dureeReelle / 60).toFixed(1) + ' h' : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Taux appliqué:</span>
                                <span>{intervention.tauxHoraireApplique || '-'} €/h</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Main d'œuvre:</span>
                                <span>{intervention.coutMainOeuvre?.toFixed(2) || '0.00'} €</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Pièces:</span>
                                <span>{intervention.coutPieces?.toFixed(2) || '0.00'} €</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span className="text-green-600">{intervention.coutTotal?.toFixed(2) || '0.00'} €</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
