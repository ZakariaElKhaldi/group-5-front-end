import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function ClientFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
    });

    useEffect(() => {
        if (isEditing) {
            api.get(`/clients/${id}`).then(res => {
                setFormData(res.data);
            }).catch(err => toast.error('Erreur chargement'));
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                await api.put(`/clients/${id}`, formData);
                toast.success('Client mis à jour');
            } else {
                await api.post('/clients', formData);
                toast.success('Client créé');
            }
            navigate('/clients');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{isEditing ? 'Modifier Client' : 'Nouveau Client'}</h1>
                <Button variant="outline" onClick={() => navigate('/clients')}>Annuler</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Informations Client</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nom</label>
                            <Input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Téléphone</label>
                            <Input value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
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
