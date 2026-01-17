import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Loader2, Check, X, RefreshCw, Clock, User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function PasswordRequestsPage() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/password-reset-requests');
            setRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!newPassword || newPassword.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setApproving(true);
        try {
            await api.put(`/password-reset-requests/${selectedRequest.id}/approve`, {
                newPassword,
            });
            toast.success('Mot de passe réinitialisé avec succès');
            setSelectedRequest(null);
            setNewPassword('');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de l\'approbation');
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async (request) => {
        setRejecting(true);
        try {
            await api.put(`/password-reset-requests/${request.id}/reject`, {
                reason: 'Demande rejetée par l\'administrateur',
            });
            toast.success('Demande rejetée');
            fetchRequests();
        } catch (error) {
            toast.error('Erreur lors du rejet');
        } finally {
            setRejecting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-700">Approuvée</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700">Rejetée</Badge>;
            default:
                return <Badge className="bg-amber-100 text-amber-700">En attente</Badge>;
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Demandes de réinitialisation
                    </h1>
                    <p className="text-muted-foreground">
                        Gérez les demandes de réinitialisation de mot de passe
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {pendingCount > 0 && (
                        <Badge variant="destructive" className="text-sm">
                            {pendingCount} en attente
                        </Badge>
                    )}
                    <Button variant="outline" onClick={fetchRequests}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Demandes</CardTitle>
                    <CardDescription>
                        Approuvez ou rejetez les demandes de réinitialisation de mot de passe
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Raison</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        Aucune demande
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {req.user?.prenom} {req.user?.nom}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {req.user?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {req.reason || <span className="text-muted-foreground italic">Non spécifiée</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true, locale: fr })}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => setSelectedRequest(req)}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Approuver
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleReject(req)}
                                                        disabled={rejecting}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Rejeter
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Approve Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Définir un nouveau mot de passe</DialogTitle>
                        <DialogDescription>
                            Définissez un nouveau mot de passe pour{' '}
                            <strong>{selectedRequest?.user?.email}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                            <Input
                                id="newPassword"
                                type="text"
                                placeholder="Au moins 8 caractères"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Communiquez ce mot de passe à l'utilisateur de manière sécurisée.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button onClick={handleApprove} disabled={approving}>
                            {approving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
