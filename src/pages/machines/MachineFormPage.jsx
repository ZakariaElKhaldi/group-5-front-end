import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function MachineFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        reference: '',
        modele: '',
        dateAchat: '',
        statut: 'En service',
    });

    useEffect(() => {
        if (isEditing) {
            api.get(`/machines/${id}`).then(res => {
                setFormData({
                    reference: res.data.reference,
                    modele: res.data.modele,
                    dateAchat: res.data.dateAchat ? res.data.dateAchat.split('T')[0] : '',
                    statut: res.data.statut
                });
            }).catch(err => toast.error('Erreur chargement'));
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                await api.put(`/machines/${id}`, formData);
                toast.success('Machine mise à jour');
            } else {
                await api.post('/machines', formData);
                toast.success('Machine créée');
            }
            navigate('/machines');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{isEditing ? 'Modifier Machine' : 'Nouvelle Machine'}</h1>
                <Button variant="outline" onClick={() => navigate('/machines')}>Annuler</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Informations Machine</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Référence</label>
                            <Input
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Modèle</label>
                            <Input
                                value={formData.modele}
                                onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date d'achat</label>
                            <Input
                                type="date"
                                value={formData.dateAchat}
                                onChange={(e) => setFormData({ ...formData, dateAchat: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
