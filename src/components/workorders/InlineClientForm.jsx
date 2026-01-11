import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

/**
 * Inline form for creating a new client without leaving the page
 * @param {function} onClientCreated - Called with new client object after creation
 * @param {function} onCancel - Called when user cancels
 */
export default function InlineClientForm({ onClientCreated, onCancel }) {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        telephone: '',
        email: '',
        adresse: '',
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {

        if (!formData.nom.trim()) {
            toast.error('Le nom du client est requis');
            return;
        }

        setSaving(true);
        try {
            const response = await api.post('/clients', formData);
            toast.success('Client créé avec succès');
            onClientCreated(response.data);
        } catch (error) {
            console.error('Error creating client:', error);
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
                            <Label htmlFor="client-nom">Nom du client *</Label>
                            <Input
                                id="client-nom"
                                value={formData.nom}
                                onChange={(e) => handleChange('nom', e.target.value)}
                                placeholder="Nom ou raison sociale"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client-telephone">Téléphone</Label>
                            <Input
                                id="client-telephone"
                                value={formData.telephone}
                                onChange={(e) => handleChange('telephone', e.target.value)}
                                placeholder="06 XX XX XX XX"
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="client-email">Email</Label>
                            <Input
                                id="client-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client-adresse">Adresse</Label>
                            <Input
                                id="client-adresse"
                                value={formData.adresse}
                                onChange={(e) => handleChange('adresse', e.target.value)}
                                placeholder="Adresse complète"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
                            <X className="h-4 w-4 mr-1" /> Annuler
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-1" /> Créer le client
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
