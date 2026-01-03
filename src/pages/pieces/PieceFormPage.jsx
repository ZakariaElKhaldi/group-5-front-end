import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

export default function PieceFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fournisseurs, setFournisseurs] = useState([]);

    const [formData, setFormData] = useState({
        reference: '',
        nom: '',
        description: '',
        prixUnitaire: '',
        quantiteStock: '',
        seuilAlerte: '5',
        emplacement: '',
        fournisseurId: '',
    });

    useEffect(() => {
        // Fetch fournisseurs for dropdown
        api.get('/fournisseurs?limit=100').then(res => {
            setFournisseurs(res.data.items || []);
        }).catch(err => console.error(err));

        if (isEditing) {
            api.get(`/pieces/${id}`).then(res => {
                const p = res.data;
                setFormData({
                    reference: p.reference || '',
                    nom: p.nom || '',
                    description: p.description || '',
                    prixUnitaire: p.prixUnitaire?.toString() || '',
                    quantiteStock: p.quantiteStock?.toString() || '',
                    seuilAlerte: p.seuilAlerte?.toString() || '5',
                    emplacement: p.emplacement || '',
                    fournisseurId: p.fournisseur?.id?.toString() || '',
                });
            }).catch(err => toast.error('Erreur chargement'));
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                reference: formData.reference,
                nom: formData.nom,
                description: formData.description,
                prixUnitaire: parseFloat(formData.prixUnitaire),
                quantiteStock: parseInt(formData.quantiteStock),
                seuilAlerte: parseInt(formData.seuilAlerte),
                emplacement: formData.emplacement,
                fournisseurId: formData.fournisseurId ? parseInt(formData.fournisseurId) : null,
            };

            if (isEditing) {
                await api.put(`/pieces/${id}`, payload);
                toast.success('Pièce mise à jour');
            } else {
                await api.post('/pieces', payload);
                toast.success('Pièce créée');
            }
            navigate('/pieces');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{isEditing ? 'Modifier Pièce' : 'Nouvelle Pièce'}</h1>
                <Button variant="outline" onClick={() => navigate('/pieces')}>Annuler</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Informations Pièce</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Référence *</label>
                                <Input
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                    placeholder="REF-001"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nom *</label>
                                <Input
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    placeholder="Nom de la pièce"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description détaillée..."
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prix unitaire (€) *</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.prixUnitaire}
                                    onChange={(e) => setFormData({ ...formData, prixUnitaire: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock initial</label>
                                <Input
                                    type="number"
                                    value={formData.quantiteStock}
                                    onChange={(e) => setFormData({ ...formData, quantiteStock: e.target.value })}
                                    disabled={isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Seuil d'alerte</label>
                                <Input
                                    type="number"
                                    value={formData.seuilAlerte}
                                    onChange={(e) => setFormData({ ...formData, seuilAlerte: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Emplacement</label>
                                <Input
                                    value={formData.emplacement}
                                    onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                                    placeholder="Ex: Étagère A3"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fournisseur</label>
                                <Select
                                    value={formData.fournisseurId}
                                    onValueChange={(val) => setFormData({ ...formData, fournisseurId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fournisseurs.map(f => (
                                            <SelectItem key={f.id} value={f.id.toString()}>{f.nom}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
