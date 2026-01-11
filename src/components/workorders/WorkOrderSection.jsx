import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Check, Lock } from 'lucide-react';
import PhotoUploader from './PhotoUploader';

/**
 * Work order details section
 * @param {boolean} isEnabled - Whether this section is enabled (machine must be selected)
 * @param {object} formData - Form data object
 * @param {function} onChange - Called when any field changes
 * @param {array} technicians - List of technicians for assignment
 * @param {boolean} isComplete - Whether all required fields are filled
 */
export default function WorkOrderSection({
    isEnabled,
    formData,
    onChange,
    technicians = [],
    isComplete,
    images = [],
    onImagesChange,
}) {
    const isDisabled = !isEnabled;

    const handleChange = (field, value) => {
        onChange({ ...formData, [field]: value });
    };

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
                                isDisabled ? <Lock className="h-4 w-4" /> : '3'}
                        </div>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            Détails de l'intervention
                        </CardTitle>
                    </div>
                    {isDisabled && (
                        <Badge variant="secondary">
                            Sélectionnez d'abord une machine
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Type, Origin, Priority */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="wo-type">Type *</Label>
                        <Select
                            value={formData.type || 'corrective'}
                            onValueChange={(v) => handleChange('type', v)}
                            disabled={isDisabled}
                        >
                            <SelectTrigger id="wo-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="corrective">Corrective</SelectItem>
                                <SelectItem value="preventive">Préventive</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-origin">Origine</Label>
                        <Select
                            value={formData.origin || 'breakdown'}
                            onValueChange={(v) => handleChange('origin', v)}
                            disabled={isDisabled}
                        >
                            <SelectTrigger id="wo-origin">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="breakdown">Panne</SelectItem>
                                <SelectItem value="scheduled">Planifié</SelectItem>
                                <SelectItem value="request">Demande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-priority">Priorité *</Label>
                        <Select
                            value={formData.priority || 'medium'}
                            onValueChange={(v) => handleChange('priority', v)}
                            disabled={isDisabled}
                        >
                            <SelectTrigger id="wo-priority">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Basse</SelectItem>
                                <SelectItem value="medium">Normale</SelectItem>
                                <SelectItem value="high">Haute</SelectItem>
                                <SelectItem value="critical">Critique</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="wo-description">Description *</Label>
                    <Textarea
                        id="wo-description"
                        value={formData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Décrivez le problème ou la tâche à effectuer..."
                        rows={4}
                        disabled={isDisabled}
                    />
                </div>

                {/* Technician & Duration */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="wo-technician">Technicien</Label>
                        <Select
                            value={formData.technicienId?.toString() || '__unassigned__'}
                            onValueChange={(v) => handleChange('technicienId', v === '__unassigned__' ? null : parseInt(v))}
                            disabled={isDisabled}
                        >
                            <SelectTrigger id="wo-technician">
                                <SelectValue placeholder="Non assigné" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__unassigned__">Non assigné</SelectItem>
                                {technicians.map((tech) => (
                                    <SelectItem key={tech.id} value={tech.id.toString()}>
                                        {tech.user?.nom} {tech.user?.prenom}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-duration">Durée estimée (minutes)</Label>
                        <Input
                            id="wo-duration"
                            type="number"
                            value={formData.estimatedDuration || ''}
                            onChange={(e) => handleChange('estimatedDuration', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="60"
                            disabled={isDisabled}
                        />
                    </div>
                </div>

                {/* Problem Photos */}
                {!isDisabled && (
                    <PhotoUploader
                        images={images}
                        onImagesChange={onImagesChange}
                        label="Photos du problème"
                        required={true}
                        readOnly={false}
                        maxImages={5}
                    />
                )}
            </CardContent>
        </Card>
    );
}
