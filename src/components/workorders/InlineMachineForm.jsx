import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import PhotoUploader, { uploadImagesToBackend } from './PhotoUploader';

/**
 * Inline form for creating a new machine without leaving the page
 * @param {number} clientId - Client ID to link the machine to
 * @param {function} onMachineCreated - Called with new machine object after creation
 * @param {function} onCancel - Called when user cancels
 */
export default function InlineMachineForm({ clientId, onMachineCreated, onCancel }) {
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        modele: '',
        reference: '',
        marque: '',
        type: '',
        numeroSerie: '',
        statut: 'Operationnel',
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {

        if (!formData.modele.trim() || !formData.reference.trim()) {
            toast.error('Le modèle et la référence sont requis');
            return;
        }

        setSaving(true);
        try {
            // Create machine first
            const response = await api.post('/machines', {
                ...formData,
                clientId,
            });
            const newMachine = response.data;

            // Upload images if any
            if (images.length > 0) {
                try {
                    await uploadImagesToBackend(newMachine.id, 'machine', images, api);
                } catch (imgError) {
                    console.error('Image upload failed:', imgError);
                    toast.error('Machine créée mais erreur lors du téléchargement des photos');
                }
            }

            toast.success('Machine créée avec succès');
            onMachineCreated(newMachine);
        } catch (error) {
            console.error('Error creating machine:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la création');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="mt-4 border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="machine-modele">Modèle *</Label>
                            <Input
                                id="machine-modele"
                                value={formData.modele}
                                onChange={(e) => handleChange('modele', e.target.value)}
                                placeholder="Ex: Presse Hydraulique XL-500"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="machine-reference">Référence *</Label>
                            <Input
                                id="machine-reference"
                                value={formData.reference}
                                onChange={(e) => handleChange('reference', e.target.value)}
                                placeholder="Ex: MCH-001"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="machine-marque">Marque</Label>
                            <Input
                                id="machine-marque"
                                value={formData.marque}
                                onChange={(e) => handleChange('marque', e.target.value)}
                                placeholder="Ex: Bosch"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="machine-type">Type</Label>
                            <Input
                                id="machine-type"
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                placeholder="Ex: Presse"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="machine-serie">N° Série</Label>
                            <Input
                                id="machine-serie"
                                value={formData.numeroSerie}
                                onChange={(e) => handleChange('numeroSerie', e.target.value)}
                                placeholder="Ex: SN2024001"
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="machine-statut">Statut</Label>
                            <Select
                                value={formData.statut}
                                onValueChange={(v) => handleChange('statut', v)}
                            >
                                <SelectTrigger id="machine-statut">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Operationnel">Opérationnel</SelectItem>
                                    <SelectItem value="En panne">En panne</SelectItem>
                                    <SelectItem value="En maintenance">En maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <PhotoUploader
                        images={images}
                        onImagesChange={setImages}
                        label="Photos de la machine"
                        required={false}
                        maxImages={5}
                    />

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
                            <X className="h-4 w-4 mr-1" /> Annuler
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-1" /> Créer la machine
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
