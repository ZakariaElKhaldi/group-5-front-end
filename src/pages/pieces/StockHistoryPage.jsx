import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    ArrowDownCircle,
    ArrowUpCircle,
    Package,
    ArrowLeft,
    Search,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Loader2,
    Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function StockHistoryPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [movements, setMovements] = useState([]);
    const [pieces, setPieces] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    // Filters
    const [pieceId, setPieceId] = useState(searchParams.get('pieceId') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
    const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

    useEffect(() => {
        fetchData();
    }, [searchParams]);

    useEffect(() => {
        fetchPieces();
    }, []);

    const fetchPieces = async () => {
        try {
            const response = await api.get('/pieces?limit=500');
            setPieces(response.data.items || []);
        } catch (error) {
            console.error('Failed to fetch pieces:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchParams.get('pieceId')) params.set('pieceId', searchParams.get('pieceId'));
            if (searchParams.get('type')) params.set('type', searchParams.get('type'));
            if (searchParams.get('dateFrom')) params.set('dateFrom', searchParams.get('dateFrom'));
            if (searchParams.get('dateTo')) params.set('dateTo', searchParams.get('dateTo'));
            params.set('page', searchParams.get('page') || '1');
            params.set('limit', '20');

            const [movementsRes, summaryRes] = await Promise.all([
                api.get(`/mouvements-stock?${params.toString()}`),
                api.get(`/mouvements-stock/summary?${params.toString()}`),
            ]);

            setMovements(movementsRes.data.items || []);
            setPagination({
                page: movementsRes.data.page,
                totalPages: movementsRes.data.totalPages,
                total: movementsRes.data.total,
            });
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Failed to fetch movements:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (pieceId && pieceId !== 'all') params.set('pieceId', pieceId);
        if (type && type !== 'all') params.set('type', type);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        setSearchParams(params);
    };

    const clearFilters = () => {
        setPieceId('all');
        setType('all');
        setDateFrom('');
        setDateTo('');
        setSearchParams(new URLSearchParams());
    };

    const goToPage = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/pieces')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Package className="h-6 w-6 text-blue-500" />
                            Historique des Mouvements de Stock
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Suivi des entrées et sorties de pièces
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700">Entrées</p>
                                    <p className="text-2xl font-bold text-green-800">{summary.entries.totalCount}</p>
                                </div>
                                <ArrowDownCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <p className="text-xs text-green-600 mt-2">
                                +{summary.entries.totalQuantite} unités
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-700">Sorties</p>
                                    <p className="text-2xl font-bold text-red-800">{summary.exits.totalCount}</p>
                                </div>
                                <ArrowUpCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <p className="text-xs text-red-600 mt-2">
                                -{summary.exits.totalQuantite} unités
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700">Balance</p>
                                    <p className="text-2xl font-bold text-blue-800">
                                        {summary.entries.totalQuantite - summary.exits.totalQuantite >= 0 ? '+' : ''}
                                        {summary.entries.totalQuantite - summary.exits.totalQuantite}
                                    </p>
                                </div>
                                {summary.entries.totalQuantite >= summary.exits.totalQuantite ? (
                                    <TrendingUp className="h-8 w-8 text-blue-600" />
                                ) : (
                                    <TrendingDown className="h-8 w-8 text-blue-600" />
                                )}
                            </div>
                            <p className="text-xs text-blue-600 mt-2">
                                unités nettes
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-700">Total</p>
                                    <p className="text-2xl font-bold text-slate-800">{pagination.total}</p>
                                </div>
                                <Package className="h-8 w-8 text-slate-600" />
                            </div>
                            <p className="text-xs text-slate-600 mt-2">
                                mouvements
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtres
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                        <Select value={pieceId} onValueChange={setPieceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Toutes les pièces" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les pièces</SelectItem>
                                {pieces.map(piece => (
                                    <SelectItem key={piece.id} value={piece.id.toString()}>
                                        {piece.reference} - {piece.nom}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tous les types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les types</SelectItem>
                                <SelectItem value="entree">Entrées</SelectItem>
                                <SelectItem value="sortie">Sorties</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            type="date"
                            placeholder="Date début"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />

                        <Input
                            type="date"
                            placeholder="Date fin"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />

                        <div className="flex gap-2">
                            <Button onClick={applyFilters} className="flex-1">
                                <Search className="h-4 w-4 mr-2" />
                                Filtrer
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Effacer
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Movements Table */}
            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucun mouvement de stock trouvé</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Pièce</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Quantité</TableHead>
                                        <TableHead className="text-right">Avant</TableHead>
                                        <TableHead className="text-right">Après</TableHead>
                                        <TableHead>Motif</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.map((movement) => (
                                        <TableRow key={movement.id}>
                                            <TableCell className="text-sm">
                                                {format(new Date(movement.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    className="text-blue-600 hover:underline font-medium"
                                                    onClick={() => navigate(`/pieces/${movement.pieceId}/edit`)}
                                                >
                                                    {movement.piece?.reference || `#${movement.pieceId}`}
                                                </button>
                                                <p className="text-xs text-muted-foreground">
                                                    {movement.piece?.nom}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        movement.type === 'entree'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }
                                                >
                                                    {movement.type === 'entree' ? (
                                                        <ArrowDownCircle className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <ArrowUpCircle className="h-3 w-3 mr-1" />
                                                    )}
                                                    {movement.type === 'entree' ? 'Entrée' : 'Sortie'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-bold">
                                                <span className={movement.type === 'entree' ? 'text-green-600' : 'text-red-600'}>
                                                    {movement.type === 'entree' ? '+' : '-'}{movement.quantite}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-muted-foreground">
                                                {movement.quantiteAvant}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {movement.quantiteApres}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                                {movement.motif || '-'}
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
