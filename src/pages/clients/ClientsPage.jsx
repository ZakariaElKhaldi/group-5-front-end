import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Edit, Trash2, Search, Phone, MessageCircle, MoreHorizontal, Settings2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isAfter, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients?limit=1000'); // Get all clients
            setClients(response.data.items || []); // Extract items from paginated response
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // Filter clients based on search
    const filteredClients = useMemo(() => {
        if (!search.trim()) return clients;

        const searchLower = search.toLowerCase();
        return clients.filter(c =>
            c.nom?.toLowerCase().includes(searchLower) ||
            c.telephone?.includes(search) ||
            c.email?.toLowerCase().includes(searchLower) ||
            c.ice?.includes(search)
        );
    }, [clients, search]);

    // Check if client is new (created in last 7 days)
    const isNewClient = (createdAt) => {
        if (!createdAt) return false;
        return isAfter(new Date(createdAt), subDays(new Date(), 7));
    };

    // Format phone for WhatsApp (Morocco)
    const formatPhoneForWhatsApp = (phone) => {
        if (!phone) return null;
        let cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '212' + cleaned.substring(1);
        }
        return cleaned;
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce client ?')) return;
        try {
            await api.delete(`/clients/${id}`);
            setClients(clients.filter(c => c.id !== id));
            toast.success('Client supprimé');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const sendWhatsAppMessage = (client, template = 'general') => {
        const phone = formatPhoneForWhatsApp(client.telephone);
        if (!phone) {
            toast.error('Numéro de téléphone invalide');
            return;
        }

        const messages = {
            general: `Bonjour ${client.nom}, nous vous contactons concernant votre machine.`,
            scheduled: `Bonjour ${client.nom}, nous vous informons qu'une intervention a été programmée pour votre machine. Nous vous contacterons pour confirmer le rendez-vous.`,
            completed: `Bonjour ${client.nom}, nous vous informons que l'intervention sur votre machine est terminée. Vous pouvez la récupérer à notre atelier.`,
            quote: `Bonjour ${client.nom}, le devis pour votre machine est prêt. Nous attendons votre validation pour procéder à l'intervention.`,
        };

        const message = encodeURIComponent(messages[template] || messages.general);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground">Gestion de la clientèle</p>
                </div>
                <Button onClick={() => navigate('/clients/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau Client
                </Button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom, téléphone, email ou ICE..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {search && (
                    <p className="text-sm text-muted-foreground">
                        {filteredClients.length} résultat{filteredClients.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead className="text-center">Machines</TableHead>
                            <TableHead>Créé le</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">Chargement...</TableCell></TableRow>
                        ) : filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    {search ? 'Aucun client trouvé pour cette recherche' : 'Aucun client'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((c) => (
                                <TableRow key={c.id} className="group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="hover:text-blue-600 hover:underline cursor-pointer"
                                                onClick={() => navigate(`/clients/${c.id}`)}
                                            >
                                                {c.nom}
                                            </span>
                                            {isNewClient(c.createdAt) && (
                                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                    Nouveau
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{c.email || '-'}</TableCell>
                                    <TableCell>
                                        {c.telephone ? (
                                            <div className="flex items-center gap-2">
                                                <span>{c.telephone}</span>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => window.open(`tel:${c.telephone}`)}
                                                        title="Appeler"
                                                    >
                                                        <Phone className="h-3 w-3" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-green-600"
                                                                title="WhatsApp"
                                                            >
                                                                <MessageCircle className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => sendWhatsAppMessage(c, 'general')}>
                                                                💬 Message général
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => sendWhatsAppMessage(c, 'scheduled')}>
                                                                📅 Intervention programmée
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => sendWhatsAppMessage(c, 'completed')}>
                                                                ✅ Intervention terminée
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => sendWhatsAppMessage(c, 'quote')}>
                                                                📋 Devis prêt
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="cursor-pointer" onClick={() => navigate(`/machines?client=${c.id}`)}>
                                            <Settings2 className="h-3 w-3 mr-1" />
                                            {c.machines?.length || 0}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {c.createdAt
                                            ? format(new Date(c.createdAt), 'dd MMM yyyy', { locale: fr })
                                            : '-'
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => navigate(`/clients/${c.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" /> Voir détails
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate(`/clients/${c.id}/edit`)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(c.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
