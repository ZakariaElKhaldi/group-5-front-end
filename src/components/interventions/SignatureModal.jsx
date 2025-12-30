import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eraser, Save } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export function SignatureModal({ open, onOpenChange, interventionId, onSuccess }) {
    const [signerNom, setSignerNom] = useState('');
    const [loading, setLoading] = useState(false);
    const sigCanvas = useRef(null);

    const handleClear = () => {
        sigCanvas.current?.clear();
    };

    const handleSave = async () => {
        if (sigCanvas.current?.isEmpty()) {
            toast.error('Veuillez signer avant de valider');
            return;
        }
        if (!signerNom.trim()) {
            toast.error('Veuillez entrer le nom du signataire');
            return;
        }

        setLoading(true);
        try {
            const signature = sigCanvas.current.toDataURL('image/png');
            await api.post(`/interventions/${interventionId}/sign`, {
                signature,
                signerNom: signerNom.trim(),
            });
            toast.success('Signature enregistrée avec succès');
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save signature:', error);
            toast.error('Erreur lors de l\'enregistrement de la signature');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Signature Client</DialogTitle>
                    <DialogDescription>
                        Le client confirme la réalisation de l'intervention
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="signerNom">Nom du signataire</Label>
                        <Input
                            id="signerNom"
                            placeholder="Entrez le nom complet"
                            value={signerNom}
                            onChange={(e) => setSignerNom(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Signature</Label>
                        <div className="border rounded-lg bg-white p-2">
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{
                                    width: 450,
                                    height: 200,
                                    className: 'signature-canvas border border-dashed border-gray-300 rounded',
                                }}
                                penColor="black"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                        >
                            <Eraser className="h-4 w-4 mr-2" />
                            Effacer
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Enregistrement...' : 'Valider & Signer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
