import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PanneFormPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedMachineId = searchParams.get('machine');

    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [createIntervention, setCreateIntervention] = useState(false);

    const [formData, setFormData] = useState({
        machine: preselectedMachineId || '',
        description: '',
        gravite: 'Moyenne',
    });

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                // Fetch with high limit for dropdown
                const response = await api.get('/machines?limit=100');
                setMachines(response.data.items || []);
            } catch (error) {
                console.error(error);
                toast.error('Erreur chargement machines');
            } finally {
                setLoading(false);
            }
        };
        fetchMachines();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.machine) {
            toast.error('Veuillez sélectionner une machine');
            return;
        }

        if (!formData.description.trim()) {
            toast.error('Veuillez décrire la panne');
            return;
        }

        setSubmitting(true);
        try {
            const panneResponse = await api.post('/pannes', {
                machineId: parseInt(formData.machine),
                description: formData.description,
                gravite: formData.gravite,
            });

            toast.success('Panne déclarée avec succès');

            if (createIntervention) {
                // Navigate to intervention form with panne pre-selected
                navigate(`/interventions/new?panne=${panneResponse.data.id}&machine=${formData.machine}`);
            } else {
                navigate('/pannes');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Erreur lors de la déclaration');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedMachine = machines.find(m => m.id === parseInt(formData.machine));

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/pannes')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                        Déclarer une Panne
                    </h1>
                    <p className="text-muted-foreground">
                        Signalez un problème sur une machine
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informations de la Panne</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Machine Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Machine concernée *</label>
                            <Select
                                value={formData.machine}
                                onValueChange={(value) => setFormData({ ...formData, machine: value })}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une machine" />
                                </SelectTrigger>
                                <SelectContent>
                                    {machines.map((machine) => (
                                        <SelectItem key={machine.id} value={machine.id.toString()}>
                                            {machine.modele} - {machine.reference}
                                            {machine.client?.nom && ` (${machine.client.nom})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedMachine && (
                                <div className="text-sm text-muted-foreground bg-slate-50 p-2 rounded">
                                    <p><strong>Marque:</strong> {selectedMachine.marque || 'N/A'}</p>
                                    <p><strong>Type:</strong> {selectedMachine.type || 'N/A'}</p>
                                    <p><strong>Client:</strong> {selectedMachine.client?.nom || 'Non assigné'}</p>
                                    <p><strong>Statut:</strong> {selectedMachine.statut}</p>
                                </div>
                            )}
                        </div>

                        {/* Gravity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Niveau de gravité *</label>
                            <Select
                                value={formData.gravite}
                                onValueChange={(value) => setFormData({ ...formData, gravite: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Faible">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Faible - Machine fonctionnelle avec dégradation mineure
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="Moyenne">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                            Moyenne - Impact sur la production
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="Elevee">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            Élevée - Machine à l'arrêt, intervention urgente
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description du problème *</label>
                            <Textarea
                                placeholder="Décrivez les symptômes, le comportement anormal, les erreurs observées..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={5}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Soyez le plus précis possible pour faciliter le diagnostic
                            </p>
                        </div>

                        {/* Create Intervention Option */}
                        <div className="flex items-center space-x-2 pt-4 border-t">
                            <Checkbox
                                id="createIntervention"
                                checked={createIntervention}
                                onCheckedChange={setCreateIntervention}
                            />
                            <label
                                htmlFor="createIntervention"
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                                Créer une intervention immédiatement après
                            </label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/pannes')}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Déclarer la panne
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
