import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle, Loader2, Clock, Wrench, Euro } from 'lucide-react';

/**
 * CompletionDialog - Dialog for technicians to complete a work order with details
 * Collects: resolution description, actual duration, labor cost, parts cost
 */
export function CompletionDialog({ open, onOpenChange, workOrder, onComplete }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        resolution: '',
        actualDuration: workOrder?.estimatedDuration || '',
        laborCost: '',
        partsCost: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.resolution.trim()) {
            return;
        }

        setLoading(true);
        try {
            await onComplete({
                status: 'completed',
                resolution: formData.resolution,
                actualDuration: formData.actualDuration ? parseInt(formData.actualDuration) : null,
                laborCost: formData.laborCost ? parseFloat(formData.laborCost) : 0,
                partsCost: formData.partsCost ? parseFloat(formData.partsCost) : 0,
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Completion error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Terminer l'intervention
                    </DialogTitle>
                    <DialogDescription>
                        Renseignez les détails de la résolution pour finaliser cet ordre de travail.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Resolution - Required */}
                    <div className="space-y-2">
                        <Label htmlFor="resolution">
                            Description de la résolution <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="resolution"
                            placeholder="Décrivez les travaux effectués et la solution apportée..."
                            rows={4}
                            value={formData.resolution}
                            onChange={(e) => handleChange('resolution', e.target.value)}
                            required
                        />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label htmlFor="duration" className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> Durée réelle (minutes)
                        </Label>
                        <Input
                            id="duration"
                            type="number"
                            min="0"
                            placeholder={workOrder?.estimatedDuration ? `Estimée: ${workOrder.estimatedDuration} min` : 'Ex: 60'}
                            value={formData.actualDuration}
                            onChange={(e) => handleChange('actualDuration', e.target.value)}
                        />
                        {workOrder?.estimatedDuration && (
                            <p className="text-xs text-muted-foreground">
                                Durée estimée: {workOrder.estimatedDuration} min
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Labor Cost */}
                        <div className="space-y-2">
                            <Label htmlFor="laborCost" className="flex items-center gap-1">
                                <Wrench className="h-4 w-4" /> Main d'œuvre (€)
                            </Label>
                            <Input
                                id="laborCost"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Ex: 150.00"
                                value={formData.laborCost}
                                onChange={(e) => handleChange('laborCost', e.target.value)}
                            />
                        </div>

                        {/* Parts Cost */}
                        <div className="space-y-2">
                            <Label htmlFor="partsCost" className="flex items-center gap-1">
                                <Euro className="h-4 w-4" /> Pièces (€)
                            </Label>
                            <Input
                                id="partsCost"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Ex: 75.50"
                                value={formData.partsCost}
                                onChange={(e) => handleChange('partsCost', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Cost Summary */}
                    {(formData.laborCost || formData.partsCost) && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Coût total estimé</span>
                                <span className="font-medium">
                                    {(parseFloat(formData.laborCost || 0) + parseFloat(formData.partsCost || 0)).toFixed(2)} €
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.resolution.trim()}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Terminer l'intervention
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
