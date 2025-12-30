import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function FournisseurFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        adresse: '',
        delaiLivraison: '',
    });

    useEffect(() => {
        if (isEditing) {
            api.get(`/fournisseurs/${id}`).then(res => {
                const f = res.data;
                setFormData({
                    nom: f.nom || '',
                    email: f.email || '',
                    telephone: f.telephone || '',
                    adresse: f.adresse || '',
                    delaiLivraison: f.delaiLivraison?.toString() || '',
                });
            }).catch(err => toast.error('Erreur chargement'));
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                nom: formData.nom,
                email: formData.email,
                telephone: formData.telephone,
                adresse: formData.adresse,
                delaiLivraison: formData.delaiLivraison ? parseInt(formData.delaiLivraison) : null,
            };

            if (isEditing) {
                await api.put(`/fournisseurs/${id}`, payload);
                toast.success('Fournisseur mis à jour');
            } else {
                await api.post('/fournisseurs', payload);
                toast.success('Fournisseur créé');
            }
            navigate('/fournisseurs');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{isEditing ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}</h1>
                <Button variant="outline" onClick={() => navigate('/fournisseurs')}>Annuler</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Informations Fournisseur</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nom *</label>
                            <Input
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Téléphone</label>
                                <Input
                                    value={formData.telephone}
                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Adresse</label>
                            <Textarea
                                value={formData.adresse}
                                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Délai de livraison (jours)</label>
                            <Input
                                type="number"
                                value={formData.delaiLivraison}
                                onChange={(e) => setFormData({ ...formData, delaiLivraison: e.target.value })}
                                placeholder="Ex: 7"
                            />
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
