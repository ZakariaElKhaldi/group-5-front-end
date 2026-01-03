import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function InterventionFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [machines, setMachines] = useState([]);
    const [techniciens, setTechniciens] = useState([]);

    const [formData, setFormData] = useState({
        machineId: '',
        technicienId: '',
        type: 'corrective',
        priorite: 'Normale',
        description: '',
        dateDebut: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
        // Extras for Create
        panneGravite: 'Moyenne',
    });

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [machinesRes, techsRes] = await Promise.all([
                    api.get('/machines?limit=100'),
                    api.get('/techniciens?limit=100')
                ]);
                setMachines(machinesRes.data.items || []);
                setTechniciens(techsRes.data.items || []);

                if (isEditing) {
                    const interventionRes = await api.get(`/interventions/${id}`);
                    const data = interventionRes.data;
                    setFormData({
                        machineId: data.machine?.id?.toString() || '',
                        technicienId: data.technicien?.id?.toString() || '',
                        type: data.type,
                        priorite: data.priorite,
                        description: data.description || '',
                        dateDebut: data.dateDebut ? data.dateDebut.slice(0, 16) : '',
                    });
                }
            } catch (error) {
                console.error('Error loading resources:', error);
                toast.error('Erreur lors du chargement des données');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchResources();
    }, [isEditing, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                machineId: parseInt(formData.machineId),
                technicienId: formData.technicienId ? parseInt(formData.technicienId) : null,
                type: formData.type,
                priorite: formData.priorite,
                description: formData.description,
                dateDebut: formData.dateDebut,
            };

            // Add panne fields only for creation + corrective
            if (!isEditing && formData.type === 'corrective') {
                payload.panneGravite = formData.panneGravite;
            }

            if (isEditing) {
                await api.put(`/interventions/${id}`, payload);
                toast.success('Intervention modifiée avec succès');
            } else {
                await api.post('/interventions', payload);
                toast.success('Intervention créée avec succès');
            }
            navigate('/interventions');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.error || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    {isEditing ? `Modifier Intervention #${id}` : 'Nouvelle Intervention'}
                </h1>
                <Button variant="outline" onClick={() => navigate('/interventions')}>
                    Annuler
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Détails de l'intervention</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Machine</label>
                                <Select
                                    value={formData.machineId}
                                    onValueChange={(val) => setFormData({ ...formData, machineId: val })}
                                    disabled={isEditing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une machine" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {machines.map((m) => (
                                            <SelectItem key={m.id} value={m.id.toString()}>
                                                {m.modele} ({m.reference})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Technicien</label>
                                <Select
                                    value={formData.technicienId}
                                    onValueChange={(val) => setFormData({ ...formData, technicienId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Assigner un technicien (optionnel)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Non assigné</SelectItem>
                                        {techniciens.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${t.statut === 'Disponible' ? 'bg-green-500' :
                                                        t.statut === 'En congé' ? 'bg-red-500' : 'bg-amber-500'
                                                        }`} />
                                                    {t.user?.nom} {t.user?.prenom}
                                                    <span className="text-[10px] text-muted-foreground ml-1">
                                                        ({t.statut})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formData.technicienId && formData.technicienId !== 'unassigned' && (
                                    techniciens.find(t => t.id.toString() === formData.technicienId)?.statut !== 'Disponible' && (
                                        <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-1 font-mono">
                                            <AlertTriangle size={12} />
                                            INDISPONIBLE / OCCUPÉ
                                        </p>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="corrective">Corrective (Panne)</SelectItem>
                                        <SelectItem value="preventive">Préventive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priorité</label>
                                <Select
                                    value={formData.priorite}
                                    onValueChange={(val) => setFormData({ ...formData, priorite: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Basse">Basse</SelectItem>
                                        <SelectItem value="Normale">Normale</SelectItem>
                                        <SelectItem value="Urgente">Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date de début</label>
                            <Input
                                type="datetime-local"
                                value={formData.dateDebut}
                                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Décrivez le problème ou la tâche..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>

                        {/* Fields specific to Creation + Corrective */}
                        {!isEditing && formData.type === 'corrective' && (
                            <div className="space-y-2 pt-2 border-t">
                                <h3 className="font-semibold text-sm mb-2">Détails de la panne (Automatique)</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Gravité de la panne</label>
                                    <Select
                                        value={formData.panneGravite}
                                        onValueChange={(val) => setFormData({ ...formData, panneGravite: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Faible">Faible</SelectItem>
                                            <SelectItem value="Moyenne">Moyenne</SelectItem>
                                            <SelectItem value="Critique">Critique</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? 'Mettre à jour' : 'Créer l\'intervention'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
