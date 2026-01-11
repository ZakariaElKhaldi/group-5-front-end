import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, ClipboardList } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ClientSection from '@/components/workorders/ClientSection';
import MachineSection from '@/components/workorders/MachineSection';
import WorkOrderSection from '@/components/workorders/WorkOrderSection';
import { uploadImagesToBackend } from '@/components/workorders/PhotoUploader';

export default function WorkOrderFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [saving, setSaving] = useState(false);
    const [technicians, setTechnicians] = useState([]);

    // Step state - separate tracking for each entity
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [selectedMachineId, setSelectedMachineId] = useState(null);
    const [workOrderImages, setWorkOrderImages] = useState([]);

    // Work order form data
    const [workOrderData, setWorkOrderData] = useState({
        type: 'corrective',
        origin: 'breakdown',
        priority: 'medium',
        severity: 'moderate',
        description: '',
        technicienId: null,
        estimatedDuration: null,
    });



    useEffect(() => {
        fetchTechnicians();
        if (isEdit) fetchWorkOrder();
    }, [id]);

    const fetchTechnicians = async () => {
        try {
            const response = await api.get('/techniciens?limit=100');
            setTechnicians(response.data.items || []);
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    };

    const fetchWorkOrder = async () => {
        try {
            const response = await api.get(`/workorders/${id}`);
            const wo = response.data;

            // Set machine first to unlock machine section
            setSelectedMachineId(wo.machineId);

            // Get client from machine
            if (wo.machine?.clientId) {
                setSelectedClientId(wo.machine.clientId);
            }

            setWorkOrderData({
                type: wo.type || 'corrective',
                origin: wo.origin || 'breakdown',
                priority: wo.priority || 'medium',
                severity: wo.severity || 'medium',
                description: wo.description || '',
                technicienId: wo.technicienId || null,
                estimatedDuration: wo.estimatedDuration || null,
            });
        } catch (error) {
            console.error('Error fetching work order:', error);
            toast.error('Erreur lors du chargement');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!selectedMachineId) {
            toast.error('Veuillez sélectionner une machine');
            return;
        }
        if (!workOrderData.description?.trim()) {
            toast.error('La description est requise');
            return;
        }
        // Require at least 1 photo for new work orders
        if (!isEdit && workOrderImages.length === 0) {
            toast.error('Au moins une photo est requise');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                machineId: selectedMachineId,
                type: workOrderData.type,
                origin: workOrderData.origin,
                priority: workOrderData.priority,
                severity: workOrderData.severity,
                description: workOrderData.description,
                technicienId: workOrderData.technicienId,
                estimatedDuration: workOrderData.estimatedDuration,
            };

            if (isEdit) {
                await api.put(`/workorders/${id}`, payload);
                toast.success('Ordre de travail modifié');
            } else {
                const response = await api.post('/workorders', payload);
                const newWorkOrder = response.data;

                // Upload work order images if any
                if (workOrderImages.length > 0) {
                    try {
                        await uploadImagesToBackend(newWorkOrder.id, 'workorder', workOrderImages, api);
                    } catch (imgError) {
                        console.error('Image upload failed:', imgError);
                        toast.error('Ordre créé mais erreur lors du téléchargement des photos');
                    }
                }

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

    // Handle client change - reset machine selection
    const handleClientChange = (clientId) => {
        setSelectedClientId(clientId);
        if (selectedMachineId) {
            setSelectedMachineId(null); // Reset machine when client changes
        }
    };

    const isWorkOrderComplete = workOrderData.description?.trim().length > 0 &&
        (isEdit || workOrderImages.length > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {isEdit ? 'Modifier l\'ordre de travail' : 'Nouvel ordre de travail'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Remplissez les sections ci-dessous pour créer un ordre de travail
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/workorders')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Client Selection */}
                <ClientSection
                    selectedClientId={selectedClientId}
                    onClientSelect={handleClientChange}
                    isComplete={selectedClientId !== null}
                />

                {/* Step 2: Machine Selection */}
                <MachineSection
                    clientId={selectedClientId}
                    selectedMachineId={selectedMachineId}
                    onMachineSelect={setSelectedMachineId}
                    isComplete={selectedMachineId !== null}
                />

                {/* Step 3: Work Order Details */}
                <WorkOrderSection
                    isEnabled={selectedMachineId !== null}
                    formData={workOrderData}
                    onChange={setWorkOrderData}
                    technicians={technicians}
                    isComplete={isWorkOrderComplete}
                    images={workOrderImages}
                    onImagesChange={setWorkOrderImages}
                />

                {/* Submit Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/workorders')}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving || !selectedMachineId || !isWorkOrderComplete}
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {isEdit ? 'Enregistrer' : 'Créer l\'ordre de travail'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
