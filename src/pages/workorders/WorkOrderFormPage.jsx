import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WorkOrderFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [machines, setMachines] = useState([]);
    const [technicians, setTechnicians] = useState([]);

    const [formData, setFormData] = useState({
        machineId: '',
        technicienId: '',
        type: 'corrective',
        origin: 'breakdown',
        priority: 'normal',
        severity: 'medium',
        description: '',
        estimatedDuration: '',
    });

    useEffect(() => {
        fetchMachines();
        fetchTechnicians();
        if (isEdit) fetchWorkOrder();
    }, [id]);

    const fetchMachines = async () => {
        try {
            const response = await api.get('/machines?limit=100');
            setMachines(response.data.items || []);
        } catch (error) {
            console.error('Error fetching machines:', error);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await api.get('/techniciens?limit=100');
            setTechnicians(response.data.items || []);
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    };

    const fetchWorkOrder = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/workorders/${id}`);
            const wo = response.data;
            setFormData({
                machineId: wo.machineId?.toString() || '',
                technicienId: wo.technicienId?.toString() || '',
                type: wo.type || 'corrective',
                origin: wo.origin || 'breakdown',
                priority: wo.priority || 'normal',
                severity: wo.severity || 'medium',
                description: wo.description || '',
                estimatedDuration: wo.estimatedDuration?.toString() || '',
            });
        } catch (error) {
            console.error('Error fetching work order:', error);
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                machineId: parseInt(formData.machineId),
                technicienId: formData.technicienId ? parseInt(formData.technicienId) : null,
                estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null,
            };

            if (isEdit) {
                await api.put(`/workorders/${id}`, payload);
                toast.success('Ordre de travail modifié');
            } else {
                await api.post('/workorders', payload);
                toast.success('Ordre de travail créé');
            }
            navigate('/workorders');
        } catch (error) {
            console.error('Error saving work order:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/workorders')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">
                        {isEdit ? 'Modifier l\'ordre de travail' : 'Nouvel ordre de travail'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Type & Origin */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Classification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type de maintenance *</Label>
                                <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="corrective">Corrective</SelectItem>
                                        <SelectItem value="preventive">Préventive</SelectItem>
                                        <SelectItem value="inspection">Inspection</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Origine</Label>
                                <Select value={formData.origin} onValueChange={(v) => handleChange('origin', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="breakdown">Panne</SelectItem>
                                        <SelectItem value="scheduled">Planifié</SelectItem>
                                        <SelectItem value="request">Demande</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Priority & Severity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Priorité</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Priorité *</Label>
                                <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Basse</SelectItem>
                                        <SelectItem value="normal">Normale</SelectItem>
                                        <SelectItem value="high">Haute</SelectItem>
                                        <SelectItem value="urgent">Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Sévérité</Label>
                                <Select value={formData.severity} onValueChange={(v) => handleChange('severity', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="minor">Mineure</SelectItem>
                                        <SelectItem value="medium">Moyenne</SelectItem>
                                        <SelectItem value="major">Majeure</SelectItem>
                                        <SelectItem value="critical">Critique</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Machine & Technician */}
                <Card>
                    <CardHeader>
                        <CardTitle>Affectation</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Machine *</Label>
                            <Select value={formData.machineId} onValueChange={(v) => handleChange('machineId', v)}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner une machine" /></SelectTrigger>
                                <SelectContent>
                                    {machines.map(m => (
                                        <SelectItem key={m.id} value={m.id.toString()}>
                                            {m.modele} - {m.reference}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Technicien</Label>
                            <Select value={formData.technicienId || '__unassigned__'} onValueChange={(v) => handleChange('technicienId', v === '__unassigned__' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="Assigner un technicien" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__unassigned__">Non assigné</SelectItem>
                                    {technicians.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.user?.nom} {t.user?.prenom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Durée estimée (minutes)</Label>
                            <Input type="number" value={formData.estimatedDuration}
                                onChange={(e) => handleChange('estimatedDuration', e.target.value)}
                                placeholder="60" />
                        </div>
                    </CardContent>
                </Card>

                {/* Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Décrivez le problème ou la tâche à effectuer..."
                            rows={4} />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/workorders')}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={saving || !formData.machineId}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {isEdit ? 'Enregistrer' : 'Créer'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
