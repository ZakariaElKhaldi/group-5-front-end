import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Package, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Component for managing pieces (parts) used in an intervention.
 * 
 * Features:
 * - View list of pieces used
 * - Add new piece from available inventory
 * - Remove piece (restores stock)
 * - Update quantity
 * - Real-time stock checking
 */
export default function InterventionPiecesManager({
    interventionId,
    piecesUtilisees = [],
    coutPieces = 0,
    isEditable = false,
    onUpdate
}) {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [availablePieces, setAvailablePieces] = useState([]);
    const [loadingPieces, setLoadingPieces] = useState(false);
    const [selectedPieceId, setSelectedPieceId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    // Fetch available pieces when dialog opens
    const fetchAvailablePieces = async () => {
        setLoadingPieces(true);
        try {
            const response = await api.get('/pieces?limit=100');
            // Extract items from paginated response and filter out pieces with 0 stock
            const inStock = (response.data.items || []).filter(p => p.quantiteStock > 0);
            setAvailablePieces(inStock);
        } catch (error) {
            console.error('Error fetching pieces:', error);
            toast.error('Erreur lors du chargement des pièces');
        } finally {
            setLoadingPieces(false);
        }
    };

    // Add piece to intervention
    const handleAddPiece = async () => {
        if (!selectedPieceId || quantity <= 0) {
            toast.error('Sélectionnez une pièce et une quantité valide');
            return;
        }

        setAdding(true);
        try {
            await api.post(`/interventions/${interventionId}/pieces`, {
                pieceId: parseInt(selectedPieceId),
                quantite: quantity
            });
            toast.success('Pièce ajoutée avec succès');
            setAddDialogOpen(false);
            setSelectedPieceId('');
            setQuantity(1);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error adding piece:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout');
        } finally {
            setAdding(false);
        }
    };

    // Remove piece from intervention
    const handleRemovePiece = async (pieceInterventionId) => {
        if (!confirm('Êtes-vous sûr de vouloir retirer cette pièce ?')) return;

        setRemovingId(pieceInterventionId);
        try {
            await api.delete(`/interventions/${interventionId}/pieces/${pieceInterventionId}`);
            toast.success('Pièce retirée');
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error removing piece:', error);
            toast.error(error.response?.data?.error || 'Erreur lors du retrait');
        } finally {
            setRemovingId(null);
        }
    };

    // Get selected piece info
    const selectedPiece = availablePieces.find(p => p.id.toString() === selectedPieceId);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-amber-500" />
                    Pièces Utilisées
                    {piecesUtilisees.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {piecesUtilisees.length}
                        </Badge>
                    )}
                </CardTitle>

                {isEditable && (
                    <Dialog open={addDialogOpen} onOpenChange={(open) => {
                        setAddDialogOpen(open);
                        if (open) fetchAvailablePieces();
                    }}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter Pièce
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter une Pièce</DialogTitle>
                            </DialogHeader>

                            {loadingPieces ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : availablePieces.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                    <p>Aucune pièce en stock</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pièce</label>
                                        <Select
                                            value={selectedPieceId}
                                            onValueChange={setSelectedPieceId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une pièce..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availablePieces.map((piece) => (
                                                    <SelectItem key={piece.id} value={piece.id.toString()}>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span>{piece.nom}</span>
                                                            <Badge
                                                                variant={piece.quantiteStock <= piece.seuilAlerte ? "destructive" : "secondary"}
                                                                className="text-xs"
                                                            >
                                                                Stock: {piece.quantiteStock}
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedPiece && (
                                        <div className="p-3 bg-slate-50 rounded-lg text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Référence:</span>
                                                <span className="font-mono">{selectedPiece.reference}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Prix unitaire:</span>
                                                <span className="font-semibold">{selectedPiece.prixUnitaire?.toFixed(2)} €</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Stock disponible:</span>
                                                <span>{selectedPiece.quantiteStock} unités</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Quantité</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max={selectedPiece?.quantiteStock || 999}
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        />
                                        {selectedPiece && quantity > selectedPiece.quantiteStock && (
                                            <p className="text-sm text-red-500">
                                                Quantité supérieure au stock disponible
                                            </p>
                                        )}
                                    </div>

                                    {selectedPiece && (
                                        <div className="pt-2 border-t">
                                            <div className="flex justify-between text-sm">
                                                <span>Coût estimé:</span>
                                                <span className="font-bold text-lg">
                                                    {(selectedPiece.prixUnitaire * quantity).toFixed(2)} €
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleAddPiece}
                                    disabled={adding || !selectedPieceId || (selectedPiece && quantity > selectedPiece.quantiteStock)}
                                >
                                    {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Ajouter
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>

            <CardContent>
                {piecesUtilisees.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune pièce utilisée pour cette intervention</p>
                        {isEditable && (
                            <p className="text-sm mt-1">
                                Cliquez sur "Ajouter Pièce" pour enregistrer les pièces utilisées
                            </p>
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead className="text-center">Quantité</TableHead>
                                <TableHead className="text-right">Prix Unit.</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                {isEditable && <TableHead className="w-[50px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {piecesUtilisees.map((pu) => (
                                <TableRow key={pu.id}>
                                    <TableCell className="font-mono text-sm">
                                        {pu.piece?.reference}
                                    </TableCell>
                                    <TableCell>{pu.piece?.nom}</TableCell>
                                    <TableCell className="text-center">{pu.quantite}</TableCell>
                                    <TableCell className="text-right">
                                        {pu.prixUnitaireApplique?.toFixed(2)} €
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {(pu.quantite * pu.prixUnitaireApplique)?.toFixed(2)} €
                                    </TableCell>
                                    {isEditable && (
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemovePiece(pu.id)}
                                                disabled={removingId === pu.id}
                                            >
                                                {removingId === pu.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            <TableRow className="bg-slate-50">
                                <TableCell
                                    colSpan={isEditable ? 5 : 4}
                                    className="text-right font-semibold"
                                >
                                    Total Pièces:
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {coutPieces?.toFixed(2)} €
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
