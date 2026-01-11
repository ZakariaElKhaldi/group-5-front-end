import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { Package, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * PartsSection - Display and manage parts used in a work order
 */
export function PartsSection({ workOrderId, workOrderPieces = [], onUpdate, canEdit = false }) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pieces, setPieces] = useState([]);
    const [loadingPieces, setLoadingPieces] = useState(false);
    const [selectedPieceId, setSelectedPieceId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const { isAdmin } = useAuth();

    // Calculate total cost
    const totalPartsCost = workOrderPieces.reduce((sum, wp) => {
        return sum + (parseFloat(wp.priceAtUse) * wp.quantity);
    }, 0);

    const fetchPieces = async () => {
        setLoadingPieces(true);
        try {
            const response = await api.get('/pieces?limit=100');
            setPieces(response.data.items || []);
        } catch (error) {
            console.error('Error fetching pieces:', error);
            toast.error('Erreur lors du chargement des pièces');
        } finally {
            setLoadingPieces(false);
        }
    };

    const handleOpenAddDialog = () => {
        fetchPieces();
        setShowAddDialog(true);
        setSelectedPieceId('');
        setQuantity(1);
    };

    const handleAddPart = async () => {
        if (!selectedPieceId) {
            toast.error('Veuillez sélectionner une pièce');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/workorders/${workOrderId}/pieces`, {
                pieceId: parseInt(selectedPieceId),
                quantity,
            });
            toast.success('Pièce ajoutée');
            setShowAddDialog(false);
            onUpdate();
        } catch (error) {
            console.error('Error adding part:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout');
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePart = async (pieceId) => {
        if (!window.confirm('Voulez-vous retirer cette pièce ? Le stock sera restauré.')) {
            return;
        }

        try {
            await api.delete(`/workorders/${workOrderId}/pieces/${pieceId}`);
            toast.success('Pièce retirée');
            onUpdate();
        } catch (error) {
            console.error('Error removing part:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
        }
    };

    const selectedPiece = pieces.find(p => p.id === parseInt(selectedPieceId));

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-amber-500" />
                            Pièces utilisées ({workOrderPieces.length})
                        </CardTitle>
                        <CardDescription>
                            Pièces détachées utilisées pour cette intervention
                        </CardDescription>
                    </div>
                    {canEdit && (
                        <Button size="sm" onClick={handleOpenAddDialog}>
                            <Plus className="h-4 w-4 mr-1" /> Ajouter
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {workOrderPieces.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune pièce enregistrée</p>
                            {canEdit && (
                                <p className="text-sm mt-1">
                                    Cliquez sur "Ajouter" pour enregistrer les pièces utilisées
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Pièce</TableHead>
                                        <TableHead className="text-center">Qté</TableHead>
                                        <TableHead className="text-right">Prix unit.</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        {canEdit && <TableHead className="w-[50px]"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workOrderPieces.map((wp) => (
                                        <TableRow key={wp.pieceId}>
                                            <TableCell className="font-mono text-sm">
                                                {wp.piece?.reference}
                                            </TableCell>
                                            <TableCell>{wp.piece?.nom}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{wp.quantity}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {parseFloat(wp.priceAtUse).toFixed(2)} €
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {(parseFloat(wp.priceAtUse) * wp.quantity).toFixed(2)} €
                                            </TableCell>
                                            {canEdit && (
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemovePart(wp.pieceId)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-end mt-4 pt-4 border-t">
                                <div className="text-right">
                                    <span className="text-muted-foreground mr-4">Coût total pièces:</span>
                                    <span className="text-lg font-bold">{totalPartsCost.toFixed(2)} €</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Add Part Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" /> Ajouter une pièce
                        </DialogTitle>
                        <DialogDescription>
                            Sélectionnez une pièce et la quantité à ajouter à cet ordre de travail.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Pièce</label>
                            {loadingPieces ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Chargement...
                                </div>
                            ) : (
                                <Select value={selectedPieceId} onValueChange={setSelectedPieceId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une pièce" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pieces.map((piece) => (
                                            <SelectItem
                                                key={piece.id}
                                                value={piece.id.toString()}
                                                disabled={piece.quantiteStock === 0}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{piece.nom}</span>
                                                    <span className="text-muted-foreground text-xs">
                                                        ({piece.reference})
                                                    </span>
                                                    {piece.quantiteStock === 0 && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Rupture
                                                        </Badge>
                                                    )}
                                                    {piece.quantiteStock > 0 && piece.quantiteStock <= 5 && (
                                                        <Badge variant="outline" className="text-xs text-amber-600">
                                                            Stock: {piece.quantiteStock}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {selectedPiece && (
                            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Prix unitaire</span>
                                    <span className="font-medium">{selectedPiece.prixUnitaire?.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Stock disponible</span>
                                    <span className={selectedPiece.quantiteStock < 5 ? 'text-amber-600 font-medium' : ''}>
                                        {selectedPiece.quantiteStock}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantité</label>
                            <Input
                                type="number"
                                min="1"
                                max={selectedPiece?.quantiteStock || 100}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            />
                            {selectedPiece && quantity > selectedPiece.quantiteStock && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Quantité supérieure au stock disponible
                                </p>
                            )}
                        </div>

                        {selectedPiece && (
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-muted-foreground">Coût total</span>
                                <span className="font-bold">
                                    {(selectedPiece.prixUnitaire * quantity).toFixed(2)} €
                                </span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleAddPart}
                            disabled={loading || !selectedPieceId || (selectedPiece && quantity > selectedPiece.quantiteStock)}
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
