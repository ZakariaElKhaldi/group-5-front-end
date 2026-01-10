import { useState, useEffect } from 'react';
import api from '@/services/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Dialog for assigning a technician to a work order
 */
export function TechnicianAssignDialog({ workOrderId, currentTechnicienId, open, onOpenChange, onAssigned }) {
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechId, setSelectedTechId] = useState(currentTechnicienId?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            fetchTechnicians();
            setSelectedTechId(currentTechnicienId?.toString() || '');
        }
    }, [open, currentTechnicienId]);

    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const response = await api.get('/techniciens?limit=100');
            setTechnicians(response.data.items || []);
        } catch (error) {
            console.error('Error fetching technicians:', error);
            toast.error('Erreur lors du chargement des techniciens');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedTechId) {
            toast.error('Veuillez sélectionner un technicien');
            return;
        }

        setSaving(true);
        try {
            await api.put(`/workorders/${workOrderId}/assign`, {
                technicienId: parseInt(selectedTechId)
            });
            toast.success('Technicien assigné avec succès');
            onOpenChange(false);
            onAssigned?.();
        } catch (error) {
            console.error('Error assigning technician:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de l\'assignation');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Assigner un technicien
                    </DialogTitle>
                    <DialogDescription>
                        Sélectionnez un technicien disponible pour cet ordre de travail
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Technicien</Label>
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un technicien" />
                                </SelectTrigger>
                                <SelectContent>
                                    {technicians.map(tech => (
                                        <SelectItem key={tech.id} value={tech.id.toString()}>
                                            <div className="flex flex-col">
                                                <span>{tech.user?.nom} {tech.user?.prenom}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {tech.specialite} - {tech.statut}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {selectedTechId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                Le statut de l'ordre de travail sera changé en <strong>Assigné</strong> après l'assignation.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleAssign} disabled={saving || !selectedTechId}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Assigner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
