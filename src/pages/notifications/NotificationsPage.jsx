import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Bell,
    Plus,
    Trash2,
    Loader2,
    AlertTriangle,
    Info,
    CheckCircle,
    Send,
    RefreshCw,
    Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function NotificationsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');

    // Create form state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newNotification, setNewNotification] = useState({
        titre: '',
        message: '',
        type: 'info',
        targetRole: '',
    });

    useEffect(() => {
        fetchNotifications();
    }, [searchParams]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchParams.get('type')) params.set('type', searchParams.get('type'));
            params.set('page', searchParams.get('page') || '1');
            params.set('limit', '20');

            const response = await api.get(`/notifications/all?${params.toString()}`);
            setNotifications(response.data.items || []);
            setPagination({
                page: response.data.page,
                totalPages: response.data.totalPages,
                total: response.data.total,
            });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newNotification.titre.trim() || !newNotification.message.trim()) {
            toast.error('Titre et message sont requis');
            return;
        }

        setCreating(true);
        try {
            await api.post('/notifications', {
                titre: newNotification.titre,
                message: newNotification.message,
                type: newNotification.type,
                targetRole: (!newNotification.targetRole || newNotification.targetRole === 'all') ? null : newNotification.targetRole,
            });
            toast.success('Notification envoyée !');
            setCreateDialogOpen(false);
            setNewNotification({ titre: '', message: '', type: 'info', targetRole: '' });
            fetchNotifications();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Erreur lors de la création');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            toast.success('Notification supprimée');
            fetchNotifications();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const applyFilter = () => {
        const params = new URLSearchParams();
        if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
        setSearchParams(params);
    };

    const clearFilter = () => {
        setTypeFilter('all');
        setSearchParams(new URLSearchParams());
    };

    const goToPage = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'alert': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const getTypeBadge = (type) => {
        const styles = {
            info: 'bg-blue-100 text-blue-700',
            warning: 'bg-amber-100 text-amber-700',
            alert: 'bg-red-100 text-red-700',
            success: 'bg-green-100 text-green-700',
        };
        return styles[type] || styles.info;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6 text-blue-500" />
                        Gestion des Notifications
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Envoyez des notifications aux utilisateurs
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchNotifications}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                    </Button>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle Notification
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Send className="h-5 w-5" />
                                    Envoyer une Notification
                                </DialogTitle>
                                <DialogDescription>
                                    Cette notification sera visible par les utilisateurs ciblés.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="titre">Titre *</Label>
                                    <Input
                                        id="titre"
                                        placeholder="Titre de la notification"
                                        value={newNotification.titre}
                                        onChange={(e) => setNewNotification(prev => ({ ...prev, titre: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message *</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Contenu de la notification..."
                                        rows={4}
                                        value={newNotification.message}
                                        onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select
                                            value={newNotification.type}
                                            onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">ℹ️ Info</SelectItem>
                                                <SelectItem value="success">✅ Succès</SelectItem>
                                                <SelectItem value="warning">⚠️ Avertissement</SelectItem>
                                                <SelectItem value="alert">🚨 Alerte</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="targetRole">Rôle cible</Label>
                                        <Select
                                            value={newNotification.targetRole}
                                            onValueChange={(value) => setNewNotification(prev => ({ ...prev, targetRole: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tous les utilisateurs" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                                                <SelectItem value="ROLE_ADMIN">Administrateurs</SelectItem>
                                                <SelectItem value="ROLE_TECHNICIAN">Techniciens</SelectItem>
                                                <SelectItem value="ROLE_RECEPTIONIST">Réceptionnistes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button onClick={handleCreate} disabled={creating}>
                                    {creating ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Envoyer
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filter */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtres
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="w-[200px]">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tous les types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="success">Succès</SelectItem>
                                    <SelectItem value="warning">Avertissement</SelectItem>
                                    <SelectItem value="alert">Alerte</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={applyFilter}>Filtrer</Button>
                        <Button variant="outline" onClick={clearFilter}>Effacer</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications Table */}
            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune notification</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Type</TableHead>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Cible</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notifications.map((notification) => (
                                        <TableRow key={notification.id}>
                                            <TableCell>
                                                {getTypeIcon(notification.type)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {notification.titre}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                                                {notification.message}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {notification.targetRole || 'Tous'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {format(new Date(notification.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Supprimer la notification ?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Cette action est irréversible. La notification sera définitivement supprimée.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(notification.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Supprimer
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Page {pagination.page} sur {pagination.totalPages} ({pagination.total} résultats)
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page <= 1}
                                            onClick={() => goToPage(pagination.page - 1)}
                                        >
                                            Précédent
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page >= pagination.totalPages}
                                            onClick={() => goToPage(pagination.page + 1)}
                                        >
                                            Suivant
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
