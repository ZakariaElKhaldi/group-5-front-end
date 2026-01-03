import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

export default function MachineFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);

    const [formData, setFormData] = useState({
        reference: '',
        modele: '',
        dateAchat: '',
        statut: 'En service',
        clientId: '',
    });

    useEffect(() => {
        // Fetch clients for dropdown
        api.get('/clients?limit=100').then(res => {
            setClients(res.data.items || []);
        }).catch(err => console.error(err));

        if (isEditing) {
            api.get(`/machines/${id}`).then(res => {
                setFormData({
                    reference: res.data.reference,
                    modele: res.data.modele,
                    dateAchat: res.data.dateAchat ? res.data.dateAchat.split('T')[0] : '',
                    statut: res.data.statut,
                    clientId: res.data.client?.id?.toString() || '',
                });
            }).catch(err => toast.error('Erreur chargement'));
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                clientId: formData.clientId ? parseInt(formData.clientId) : null,
            };
            if (isEditing) {
                await api.put(`/machines/${id}`, payload);
                toast.success('Machine mise à jour');
            } else {
                await api.post('/machines', payload);
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Client / Propriétaire</label>
                            <Select
                                value={formData.clientId}
                                onValueChange={(val) => setFormData({ ...formData, clientId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un client (optionnel)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
