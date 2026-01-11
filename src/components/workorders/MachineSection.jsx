import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wrench, Plus, Check, Lock } from 'lucide-react';
import InlineMachineForm from './InlineMachineForm';
import api from '@/services/api';

/**
 * Machine selection section with inline creation option
 * @param {number|null} clientId - Selected client ID (required to show this section)
 * @param {number|null} selectedMachineId - Currently selected machine ID
 * @param {function} onMachineSelect - Called when machine is selected or created
 * @param {boolean} isComplete - Whether this step is complete
 */
export default function MachineSection({ clientId, selectedMachineId, onMachineSelect, isComplete }) {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);

    const isDisabled = !clientId;

    useEffect(() => {
        if (clientId) {
            fetchMachines();
        } else {
            setMachines([]);
        }
    }, [clientId]);

    const fetchMachines = async () => {
        setLoading(true);
        try {
            // Fetch machines filtered by client
            const response = await api.get(`/machines?clientId=${clientId}&limit=100`);
            setMachines(response.data.items || []);
        } catch (error) {
            console.error('Error fetching machines:', error);
            // If filter fails, fetch all and filter client-side
            try {
                const allResponse = await api.get('/machines?limit=100');
                const filtered = (allResponse.data.items || []).filter(m => m.clientId === clientId);
                setMachines(filtered);
            } catch {
                setMachines([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMachineCreated = (newMachine) => {
        // Add to list and auto-select
        setMachines(prev => [newMachine, ...prev]);
        onMachineSelect(newMachine.id);
        setShowNewForm(false);
    };

    const selectedMachine = machines.find(m => m.id === selectedMachineId);

    return (
        <Card className={`transition-opacity ${isDisabled ? 'opacity-50' : ''} ${isComplete ? 'border-green-500/50' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isComplete ? 'bg-green-500 text-white' :
                                isDisabled ? 'bg-muted text-muted-foreground' :
                                    'bg-primary text-primary-foreground'
                            }`}>
                            {isComplete ? <Check className="h-4 w-4" /> :
                                isDisabled ? <Lock className="h-4 w-4" /> : '2'}
                        </div>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            Machine
                        </CardTitle>
                    </div>
                    {selectedMachine && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            ✓ Sélectionnée
                        </Badge>
                    )}
                    {isDisabled && (
                        <Badge variant="secondary">
                            Sélectionnez d'abord un client
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="machine-select" className="sr-only">Sélectionner une machine</Label>
                        <Select
                            value={selectedMachineId?.toString() || ''}
                            onValueChange={(v) => {
                                onMachineSelect(parseInt(v));
                                setShowNewForm(false);
                            }}
                            disabled={isDisabled || loading}
                        >
                            <SelectTrigger id="machine-select">
                                <SelectValue placeholder={
                                    loading ? 'Chargement...' :
                                        machines.length === 0 ? 'Aucune machine pour ce client' :
                                            'Sélectionner une machine existante'
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {machines.map((machine) => (
                                    <SelectItem key={machine.id} value={machine.id.toString()}>
                                        {machine.modele} - {machine.reference}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type="button"
                        variant={showNewForm ? 'secondary' : 'outline'}
                        onClick={() => setShowNewForm(!showNewForm)}
                        disabled={isDisabled}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Nouvelle
                    </Button>
                </div>

                {showNewForm && clientId && (
                    <InlineMachineForm
                        clientId={clientId}
                        onMachineCreated={handleMachineCreated}
                        onCancel={() => setShowNewForm(false)}
                    />
                )}
            </CardContent>
        </Card>
    );
}
