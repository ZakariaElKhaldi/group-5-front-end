import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Status badge component for WorkOrder
const StatusBadge = ({ status }) => {
    const statusConfig = {
        reported: { label: 'Signalé', variant: 'secondary' },
        assigned: { label: 'Assigné', variant: 'outline' },
        in_progress: { label: 'En cours', variant: 'default' },
        completed: { label: 'Terminé', variant: 'success' },
        cancelled: { label: 'Annulé', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' };

    return (
        <Badge variant={config.variant} className={
            status === 'completed' ? 'bg-green-500 hover:bg-green-600' :
                status === 'in_progress' ? 'bg-blue-500 hover:bg-blue-600' :
                    status === 'assigned' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''
        }>
            {config.label}
        </Badge>
    );
};

// Priority badge component
const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
        low: { label: 'Basse', className: 'bg-gray-100 text-gray-800' },
        normal: { label: 'Normale', className: 'bg-blue-100 text-blue-800' },
        high: { label: 'Haute', className: 'bg-orange-100 text-orange-800' },
        urgent: { label: 'Urgente', className: 'bg-red-100 text-red-800' },
    };
    const config = priorityConfig[priority] || { label: priority, className: 'bg-gray-100' };

    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
};

// Type badge component
const TypeBadge = ({ type }) => {
    const typeConfig = {
        corrective: { label: 'Corrective', className: 'bg-red-50 text-red-700 border-red-200' },
        preventive: { label: 'Préventive', className: 'bg-green-50 text-green-700 border-green-200' },
        inspection: { label: 'Inspection', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    };
    const config = typeConfig[type] || { label: type, className: '' };

    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
};

export default function WorkOrdersPage() {
    const [workOrders, setWorkOrders] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: 'all',
        type: 'all',
        priority: 'all',
        search: '',
    });
    const navigate = useNavigate();
    const { isTechnicien, isAdmin, getTechnicienId } = useAuth();

    const fetchWorkOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: filters.page,
                limit: filters.limit,
            });
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.type !== 'all') params.append('type', filters.type);
            if (filters.priority !== 'all') params.append('priority', filters.priority);
            if (filters.search) params.append('search', filters.search);

            // If technician, filter by their ID
            if (isTechnicien() && !isAdmin()) {
                const techId = getTechnicienId();
                if (techId) params.append('technicienId', techId);
            }

            const response = await api.get(`/workorders?${params.toString()}`);
            setWorkOrders(response.data.items || []);
            setPagination({
                total: response.data.total,
                page: response.data.page,
                totalPages: response.data.totalPages
            });
        } catch (error) {
            console.error('Error fetching work orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkOrders();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-8 w-8" />
                        Ordres de Travail
                    </h1>
                    <p className="text-muted-foreground">
                        Gérez les maintenances correctives et préventives
                    </p>
                </div>
                <Button onClick={() => navigate('/workorders/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouvel Ordre
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-lg border">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-8 w-full max-w-sm"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>

                <Select value={filters.status} onValueChange={(val) => handleFilterChange('status', val)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="reported">Signalé</SelectItem>
                        <SelectItem value="assigned">Assigné</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.type} onValueChange={(val) => handleFilterChange('type', val)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous types</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                        <SelectItem value="preventive">Préventive</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.priority} onValueChange={(val) => handleFilterChange('priority', val)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N°</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Machine</TableHead>
                            <TableHead>Technicien</TableHead>
                            <TableHead>Priorité</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24">
                                    Chargement...
                                </TableCell>
                            </TableRow>
                        ) : workOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                    Aucun ordre de travail trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            workOrders.map((wo) => (
                                <TableRow key={wo.id} className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => navigate(`/workorders/${wo.id}`)}>
                                    <TableCell className="font-medium">#{wo.id}</TableCell>
                                    <TableCell><TypeBadge type={wo.type} /></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{wo.machine?.modele}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {wo.machine?.reference}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {wo.technicien ? (
                                            <span className="text-sm">
                                                {wo.technicien.user?.nom} {wo.technicien.user?.prenom}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">Non assigné</span>
                                        )}
                                    </TableCell>
                                    <TableCell><PriorityBadge priority={wo.priority} /></TableCell>
                                    <TableCell><StatusBadge status={wo.status} /></TableCell>
                                    <TableCell>
                                        {wo.dateReported && format(new Date(wo.dateReported), 'dd MMM yyyy', { locale: fr })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/workorders/${wo.id}`); }}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{pagination.total}</span> ordres
                </p>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        Page <span className="font-medium text-foreground">{pagination.page}</span> sur {pagination.totalPages || 1}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"
                            onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                            disabled={filters.page === 1 || loading}>
                            Précédent
                        </Button>
                        <Button variant="outline" size="sm"
                            onClick={() => handleFilterChange('page', filters.page + 1)}
                            disabled={filters.page >= pagination.totalPages || loading}>
                            Suivant
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
