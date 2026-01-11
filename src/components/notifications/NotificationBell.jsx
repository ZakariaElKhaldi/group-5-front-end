import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Info, AlertTriangle, X, History } from 'lucide-react';
import api from '@/services/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastNotificationIds = useRef(new Set());

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications?limit=20');
            const data = Array.isArray(response.data) ? response.data : [];

            // Check for new notifications and show toast
            const newNotifications = data.filter(n => !lastNotificationIds.current.has(n.id));
            if (newNotifications.length > 0 && lastNotificationIds.current.size > 0) {
                newNotifications.forEach(n => {
                    toast(n.titre, { icon: '🔔', duration: 4000 });
                });
            }

            // Update tracked IDs
            lastNotificationIds.current = new Set(data.map(n => n.id));

            setNotifications(data);
            setUnreadCount(data.length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications([]);
            setUnreadCount(0);
            toast.success('Toutes les notifications marquées comme lues');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast.error('Erreur lors du marquage');
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-xs font-normal text-muted-foreground">
                            {unreadCount} non lues
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Aucune nouvelle notification
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div key={n.id} className="p-3 border-b last:border-0 hover:bg-muted/50 transition-colors group relative">
                                <div className="flex gap-3">
                                    <div className="mt-1">{getTypeIcon(n.type)}</div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{n.titre}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => markAsRead(n.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="w-full text-center text-xs text-muted-foreground justify-center cursor-pointer"
                            onClick={markAllAsRead}
                        >
                            Tout marquer comme lu
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="w-full text-center text-xs justify-center cursor-pointer">
                    <Link to="/my-notifications" className="flex items-center gap-1">
                        <History className="h-3 w-3" />
                        Voir l'historique
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
