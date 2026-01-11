import { useRef, useState, useCallback } from 'react';
import api from '@/services/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PenTool, Eraser, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Client signature modal for work order completion
 * Only available for completed work orders that haven't been signed yet
 */
export function SignatureModal({ workOrderId, open, onOpenChange, onSigned }) {
    const canvasRef = useRef(null);
    const [signerName, setSignerName] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [saving, setSaving] = useState(false);

    // Callback ref - runs once when canvas mounts, efficiently clears it
    const initCanvas = useCallback((canvas) => {
        if (canvas) {
            canvasRef.current = canvas;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Reset state
            setSignerName('');
            setHasSignature(false);
        }
    }, []);

    const getMousePos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getMousePos(e, canvas);

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getMousePos(e, canvas);

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const handleSubmit = async () => {
        if (!hasSignature) {
            toast.error('Veuillez signer dans le cadre');
            return;
        }
        if (!signerName.trim()) {
            toast.error('Veuillez entrer le nom du signataire');
            return;
        }

        setSaving(true);
        try {
            const canvas = canvasRef.current;
            const signatureData = canvas.toDataURL('image/png');

            await api.post(`/workorders/${workOrderId}/signature`, {
                signature: signatureData,
                signerName: signerName.trim()
            });

            toast.success('Signature enregistrée');
            onOpenChange(false);
            onSigned?.();
        } catch (error) {
            console.error('Error saving signature:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PenTool className="h-5 w-5" />
                        Signature Client
                    </DialogTitle>
                    <DialogDescription>
                        Le client doit signer pour confirmer la fin de l'intervention
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="signerName">Nom du signataire *</Label>
                        <Input
                            id="signerName"
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            placeholder="Nom complet du client"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Signature *</Label>
                            <Button variant="ghost" size="sm" onClick={clearCanvas}>
                                <Eraser className="h-4 w-4 mr-1" /> Effacer
                            </Button>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
                            <canvas
                                ref={initCanvas}
                                width={400}
                                height={200}
                                className="w-full cursor-crosshair touch-none"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Signez avec la souris ou le doigt
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving || !hasSignature || !signerName.trim()}>
                        {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4 mr-2" />
                        )}
                        Valider la signature
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
