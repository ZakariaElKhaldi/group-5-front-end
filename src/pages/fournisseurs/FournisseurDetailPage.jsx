import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Truck,
    Mail,
    Phone,
    MapPin,
    Clock,
    Package,
    AlertTriangle,
    Edit,
    Loader2,
    ExternalLink,
    Search,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function FournisseurDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fournisseur, setFournisseur] = useState(null);
    const [pieces, setPieces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || id === 'undefined') {
            setLoading(false);
            navigate('/fournisseurs');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch fournisseur details
                const fRes = await api.get(`/fournisseurs/${id}`);
                setFournisseur(fRes.data);

                // Fetch pieces supplied by this fournisseur
                const pRes = await api.get('/pieces?limit=100');
                const fournisseurPieces = (pRes.data || []).filter(
                    p => p.fournisseur?.id === parseInt(id)
                );
                setPieces(fournisseurPieces);

            } catch (error) {
                console.error('Error loading fournisseur:', error);
                toast.error('Erreur lors du chargement du fournisseur');
                navigate('/fournisseurs');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!fournisseur) {
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/fournisseurs')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Truck className="h-6 w-6 text-amber-500" />
                            {fournisseur.nom}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Fournisseur #{fournisseur.id} • {pieces.length} pièce(s) référencée(s)
                        </p>
                    </div>
                </div>
                <Button onClick={() => navigate(`/fournisseurs/${id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Fournisseur Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informations de Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fournisseur.email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <a href={`mailto:${fournisseur.email}`} className="text-blue-600 hover:underline">
                                            {fournisseur.email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {fournisseur.telephone && (
                                <div className="flex items-start gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Téléphone</p>
                                        <a href={`tel:${fournisseur.telephone}`} className="hover:underline">
                                            {fournisseur.telephone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {fournisseur.adresse && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Adresse</p>
                                        <p className="text-sm">{fournisseur.adresse}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Délai de Livraison Moyen</p>
                                    <p className="font-semibold">{fournisseur.delaiLivraison || '-'} jours</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Statistiques Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{pieces.length}</p>
                                    <p className="text-xs text-muted-foreground">Pièces</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">
                                        {pieces.filter(p => p.quantiteStock <= p.seuilAlerte).length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">En Alerte</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Valeur du stock</span>
                                <span className="font-bold">
                                    {pieces.reduce((sum, p) => sum + (p.quantiteStock * p.prixUnitaire), 0).toFixed(2)} €
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Supplied Pieces List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-slate-500" />
                                Catalogue des Pièces ({pieces.length})
                            </CardTitle>
                            <CardDescription>
                                Pièces fournies par {fournisseur.nom}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pieces.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Aucune pièce associée à ce fournisseur</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Référence</TableHead>
                                            <TableHead>Nom</TableHead>
                                            <TableHead>Prix Unit.</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pieces.map((piece) => (
                                            <TableRow key={piece.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {piece.reference}
                                                </TableCell>
                                                <TableCell className="font-medium">{piece.nom}</TableCell>
                                                <TableCell>{piece.prixUnitaire?.toFixed(2)} €</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={piece.quantiteStock <= piece.seuilAlerte ? 'text-red-600 font-bold' : ''}>
                                                            {piece.quantiteStock}
                                                        </span>
                                                        {piece.quantiteStock <= piece.seuilAlerte && (
                                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/pieces/${piece.id}/edit`)}
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
