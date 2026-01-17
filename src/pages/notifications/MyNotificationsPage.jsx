import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Bell, Loader2, AlertTriangle, Info, CheckCircle,
    Inbox, History, Check, Plus, Send, RefreshCw, ExternalLink, Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export default function MyNotificationsPage() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [tab, setTab] = useState('inbox');
    const [inboxNotifications, setInboxNotifications] = useState([]);
    const [historyNotifications, setHistoryNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Admin create form
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newNotification, setNewNotification] = useState({
        titre: '',
        message: '',
        type: 'info',
        targetRole: 'all',
    });

    useEffect(() => {
        fetchNotifications();
    }, [tab]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            if (tab === 'inbox') {
                const response = await api.get('/notifications?limit=50');
                setInboxNotifications(response.data);
            } else {
                const response = await api.get('/notifications/history?limit=50');
                setHistoryNotifications(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setInboxNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Marquée comme lue');
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (tab === 'inbox') {
            await markAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setInboxNotifications([]);
            toast.success('Toutes marquées comme lues');
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const handleCreate = async () => {
        if (!newNotification.titre.trim() || !newNotification.message.trim()) {
            toast.error('Titre et message requis');
            return;
        }

        setCreating(true);
        try {
            await api.post('/notifications', {
                titre: newNotification.titre,
                message: newNotification.message,
                type: newNotification.type,
                targetRole: newNotification.targetRole === 'all' ? null : newNotification.targetRole,
            });
            toast.success('Notification envoyée !');
            setCreateDialogOpen(false);
            setNewNotification({ titre: '', message: '', type: 'info', targetRole: 'all' });
            fetchNotifications();
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Erreur lors de la création');
        } finally {
            setCreating(false);
        }
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

    const notifications = tab === 'inbox' ? inboxNotifications : historyNotifications;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Notifications
                    </h1>
                    <p className="text-muted-foreground">Gérez vos notifications et votre historique</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchNotifications}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                    </Button>
                    {tab === 'inbox' && inboxNotifications.length > 0 && (
                        <Button variant="outline" onClick={markAllAsRead}>
                            <Check className="h-4 w-4 mr-2" />
                            Tout marquer lu
                        </Button>
                    )}
                    {isAdmin() && (
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
                                            rows={3}
                                            value={newNotification.message}
                                            onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type</Label>
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
                                            <Label>Destinataires</Label>
                                            <Select
                                                value={newNotification.targetRole}
                                                onValueChange={(value) => setNewNotification(prev => ({ ...prev, targetRole: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Tous</SelectItem>
                                                    <SelectItem value="ROLE_ADMIN">Admins</SelectItem>
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
                                        {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                        Envoyer
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="inbox" className="flex items-center gap-2">
                            <Inbox className="h-4 w-4" />
                            Boîte de réception
                            {inboxNotifications.length > 0 && (
                                <Badge variant="secondary">{inboxNotifications.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Historique
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Type</TableHead>
                            <TableHead>Titre</TableHead>
                            <TableHead className="hidden md:table-cell">Message</TableHead>
                            <TableHead>Date</TableHead>
                            {tab === 'history' && <TableHead>Statut</TableHead>}
                            {tab === 'inbox' && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={tab === 'inbox' ? 5 : 5} className="text-center h-24">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : notifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={tab === 'inbox' ? 5 : 5} className="text-center h-24 text-muted-foreground">
                                    {tab === 'inbox' ? 'Aucune nouvelle notification' : 'Aucun historique'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            notifications.map((n) => (
                                <TableRow
                                    key={n.id}
                                    className={n.actionUrl ? 'cursor-pointer hover:bg-muted/50' : ''}
                                    onClick={() => n.actionUrl && handleNotificationClick(n)}
                                >
                                    <TableCell>{getTypeIcon(n.type)}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-1">
                                            {n.titre}
                                            {n.actionUrl && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-[300px] truncate">
                                        {n.message}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                                    </TableCell>
                                    {tab === 'history' && (
                                        <TableCell>
                                            <Badge variant="outline" className="text-green-600">
                                                <Check className="h-3 w-3 mr-1" />
                                                Lu
                                            </Badge>
                                        </TableCell>
                                    )}
                                    {tab === 'inbox' && (
                                        <TableCell className="text-right space-x-2">
                                            {n.actionUrl && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                    onClick={(e) => { e.stopPropagation(); handleNotificationClick(n); }}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Voir
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Marquer lu
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{notifications.length}</span> notification{notifications.length !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
}
