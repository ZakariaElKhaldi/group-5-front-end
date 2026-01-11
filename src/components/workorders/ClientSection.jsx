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
import { Building2, Plus, Check } from 'lucide-react';
import InlineClientForm from './InlineClientForm';
import api from '@/services/api';

/**
 * Client selection section with inline creation option
 * @param {number|null} selectedClientId - Currently selected client ID
 * @param {function} onClientSelect - Called when client is selected or created
 * @param {boolean} isComplete - Whether this step is complete
 */
export default function ClientSection({ selectedClientId, onClientSelect, isComplete }) {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients?limit=100');
            setClients(response.data.items || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClientCreated = (newClient) => {
        // Add to list and auto-select
        setClients(prev => [newClient, ...prev]);
        onClientSelect(newClient.id);
        setShowNewForm(false);
    };

    const selectedClient = clients.find(c => c.id === selectedClientId);

    return (
        <Card className={isComplete ? 'border-green-500/50' : ''}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isComplete ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'
                            }`}>
                            {isComplete ? <Check className="h-4 w-4" /> : '1'}
                        </div>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Client
                        </CardTitle>
                    </div>
                    {selectedClient && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            ✓ Sélectionné
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="client-select" className="sr-only">Sélectionner un client</Label>
                        <Select
                            value={selectedClientId?.toString() || ''}
                            onValueChange={(v) => {
                                onClientSelect(parseInt(v));
                                setShowNewForm(false);
                            }}
                            disabled={loading}
                        >
                            <SelectTrigger id="client-select">
                                <SelectValue placeholder={loading ? 'Chargement...' : 'Sélectionner un client existant'} />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id.toString()}>
                                        {client.nom} {client.telephone && `- ${client.telephone}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type="button"
                        variant={showNewForm ? 'secondary' : 'outline'}
                        onClick={() => setShowNewForm(!showNewForm)}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Nouveau
                    </Button>
                </div>

                {showNewForm && (
                    <InlineClientForm
                        onClientCreated={handleClientCreated}
                        onCancel={() => setShowNewForm(false)}
                    />
                )}
            </CardContent>
        </Card>
    );
}
