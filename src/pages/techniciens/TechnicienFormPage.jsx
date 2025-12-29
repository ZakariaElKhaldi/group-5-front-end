import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

export default function TechnicienFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '', // Only for creation
        specialite: '',
        tauxHoraire: '',
        statut: 'Disponible',
    });

    useEffect(() => {
        if (isEditing) {
            api.get(`/techniciens/${id}`).then(res => {
                const t = res.data;
                setFormData({
                    nom: t.user?.nom || '',
                    prenom: t.user?.prenom || '',
                    email: t.user?.email || '',
                    specialite: t.specialite || '',
                    tauxHoraire: t.tauxHoraire || '',
                    statut: t.statut || 'Disponible',
                    password: '',
                });
            }).catch(err => toast.error('Erreur chargement'));
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            if (isEditing) delete payload.password; // Don't send empty password on edit

            if (isEditing) {
                await api.put(`/techniciens/${id}`, payload);
                toast.success('Technicien mis à jour');
            } else {
                await api.post('/techniciens', payload);
                toast.success('Technicien créé');
            }
            navigate('/techniciens');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{isEditing ? 'Modifier Technicien' : 'Nouveau Technicien'}</h1>
                <Button variant="outline" onClick={() => navigate('/techniciens')}>Annuler</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Informations Personnelles & Pro</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nom</label>
                                <Input value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prénom</label>
                                <Input value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            {!isEditing && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mot de passe</label>
                                    <Input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required placeholder="password123" />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Spécialité</label>
                                <Input value={formData.specialite} onChange={e => setFormData({ ...formData, specialite: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Taux Horaire (€)</label>
                                <Input type="number" step="0.01" value={formData.tauxHoraire} onChange={e => setFormData({ ...formData, tauxHoraire: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Statut</label>
                            <Select value={formData.statut} onValueChange={val => setFormData({ ...formData, statut: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Disponible">Disponible</SelectItem>
                                    <SelectItem value="En intervention">En intervention</SelectItem>
                                    <SelectItem value="Absent">Absent</SelectItem>
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
