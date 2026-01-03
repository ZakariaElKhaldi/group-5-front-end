import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Plus,
    Search,
    AlertTriangle,
    ExternalLink,
    Eye,
    Settings2,
    Calendar,
    FileText,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PannesPage() {
    const [pannes, setPannes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatut, setFilterStatut] = useState('all');
    const [filterGravite, setFilterGravite] = useState('all');
    const [selectedPanne, setSelectedPanne] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const navigate = useNavigate();

    const fetchPannes = async () => {
        try {
            const response = await api.get('/pannes');
            setPannes(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Erreur chargement pannes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPannes();
    }, []);

    // Filter pannes
    const filteredPannes = useMemo(() => {
        return pannes.filter(panne => {
            // Search filter
            if (search) {
                const searchLower = search.toLowerCase();
                const matchesSearch =
                    panne.machine?.modele?.toLowerCase().includes(searchLower) ||
                    panne.machine?.reference?.toLowerCase().includes(searchLower) ||
                    panne.description?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filterStatut !== 'all' && panne.statut !== filterStatut) return false;

            // Gravity filter
            if (filterGravite !== 'all' && panne.gravite !== filterGravite) return false;

            return true;
        });
    }, [pannes, search, filterStatut, filterGravite]);

    const getGraviteBadge = (gravite) => {
        const colors = {
            'Faible': 'bg-green-100 text-green-800 border-green-200',
            'Moyenne': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Elevee': 'bg-red-100 text-red-800 border-red-200',
        };
        return (
            <Badge variant="outline" className={colors[gravite] || 'bg-gray-100 text-gray-800'}>
                {gravite}
            </Badge>
        );
    };

    const getStatutBadge = (statut) => {
        const colors = {
            'Declaree': 'bg-orange-100 text-orange-800 border-orange-200',
            'En traitement': 'bg-blue-100 text-blue-800 border-blue-200',
            'Resolue': 'bg-green-100 text-green-800 border-green-200',
        };
        return (
            <Badge variant="outline" className={colors[statut] || 'bg-gray-100 text-gray-800'}>
                {statut}
            </Badge>
        );
    };

    const openPanneDetail = (panne) => {
        setSelectedPanne(panne);
        setDetailDialogOpen(true);
    };

    // Stats
    const stats = useMemo(() => ({
        total: pannes.length,
        declarees: pannes.filter(p => p.statut === 'Declaree').length,
        enTraitement: pannes.filter(p => p.statut === 'En traitement').length,
        resolues: pannes.filter(p => p.statut === 'Resolue').length,
    }), [pannes]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-amber-500" />
                        Gestion des Pannes
                    </h1>
                    <p className="text-muted-foreground">Suivi des pannes déclarées et leur traitement</p>
                </div>
                <Button onClick={() => navigate('/pannes/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Déclarer une Panne
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="cursor-pointer hover:bg-slate-50" onClick={() => setFilterStatut('all')}>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-orange-50" onClick={() => setFilterStatut('Declaree')}>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Déclarées</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.declarees}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-blue-50" onClick={() => setFilterStatut('En traitement')}>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">En traitement</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.enTraitement}</p>
                            </div>
                            <Settings2 className="h-8 w-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-green-50" onClick={() => setFilterStatut('Resolue')}>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Résolues</p>
                                <p className="text-2xl font-bold text-green-600">{stats.resolues}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                ✓
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher machine ou description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatut} onValueChange={setFilterStatut}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="Declaree">Déclarée</SelectItem>
                        <SelectItem value="En traitement">En traitement</SelectItem>
                        <SelectItem value="Resolue">Résolue</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterGravite} onValueChange={setFilterGravite}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Gravité" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes gravités</SelectItem>
                        <SelectItem value="Faible">Faible</SelectItem>
                        <SelectItem value="Moyenne">Moyenne</SelectItem>
                        <SelectItem value="Elevee">Élevée</SelectItem>
                    </SelectContent>
                </Select>
                {(filterStatut !== 'all' || filterGravite !== 'all' || search) && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setFilterStatut('all');
                            setFilterGravite('all');
                            setSearch('');
                        }}
                    >
                        Réinitialiser
                    </Button>
                )}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Machine</TableHead>
                            <TableHead>Date Déclaration</TableHead>
                            <TableHead>Gravité</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Intervention</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center h-24">Chargement...</TableCell></TableRow>
                        ) : filteredPannes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    {search || filterStatut !== 'all' || filterGravite !== 'all'
                                        ? 'Aucune panne correspondant aux filtres'
                                        : 'Aucune panne répertoriée'
                                    }
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPannes.map((panne) => (
                                <TableRow key={panne.id} className="cursor-pointer hover:bg-slate-50" onClick={() => openPanneDetail(panne)}>
                                    <TableCell className="font-medium">
                                        <div>
                                            {panne.machine?.modele}
                                            <span className="text-muted-foreground text-xs block">
                                                {panne.machine?.reference}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {format(new Date(panne.dateDeclaration), 'dd MMM yyyy HH:mm', { locale: fr })}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getGraviteBadge(panne.gravite)}</TableCell>
                                    <TableCell>{getStatutBadge(panne.statut)}</TableCell>
                                    <TableCell>
                                        {panne.intervention ? (
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle both object {id: X} and direct ID formats
                                                    const interventionId = typeof panne.intervention === 'object'
                                                        ? panne.intervention.id
                                                        : panne.intervention;
                                                    navigate(`/interventions/${interventionId}`);
                                                }}
                                            >
                                                #{typeof panne.intervention === 'object' ? panne.intervention.id : panne.intervention}
                                                <ExternalLink className="ml-1 h-3 w-3" />
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <p className="truncate" title={panne.description}>
                                            {panne.description || '-'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openPanneDetail(panne);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Panne Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Détails de la Panne
                        </DialogTitle>
                    </DialogHeader>
                    {selectedPanne && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Machine</p>
                                    <p className="font-medium">{selectedPanne.machine?.modele}</p>
                                    <p className="text-sm text-muted-foreground">{selectedPanne.machine?.reference}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Client</p>
                                    <p className="font-medium">{selectedPanne.machine?.client?.nom || 'Non assigné'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date de déclaration</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedPanne.dateDeclaration), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Gravité</p>
                                    {getGraviteBadge(selectedPanne.gravite)}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Statut</p>
                                    {getStatutBadge(selectedPanne.statut)}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Intervention liée</p>
                                    {selectedPanne.intervention ? (
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto"
                                            onClick={() => {
                                                setDetailDialogOpen(false);
                                                const interventionId = typeof selectedPanne.intervention === 'object'
                                                    ? selectedPanne.intervention.id
                                                    : selectedPanne.intervention;
                                                navigate(`/interventions/${interventionId}`);
                                            }}
                                        >
                                            Intervention #{typeof selectedPanne.intervention === 'object' ? selectedPanne.intervention.id : selectedPanne.intervention}
                                            <ExternalLink className="ml-1 h-3 w-3" />
                                        </Button>
                                    ) : (
                                        <span className="text-muted-foreground">Aucune</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Description</p>
                                <div className="bg-slate-50 p-4 rounded-lg border">
                                    <p className="whitespace-pre-wrap">{selectedPanne.description || 'Aucune description fournie'}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                {!selectedPanne.intervention && (
                                    <Button
                                        onClick={() => {
                                            setDetailDialogOpen(false);
                                            navigate(`/interventions/new?panne=${selectedPanne.id}&machine=${selectedPanne.machine?.id}`);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Créer une intervention
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
