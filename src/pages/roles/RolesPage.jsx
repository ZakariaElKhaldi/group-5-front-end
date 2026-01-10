import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Shield, Plus, Edit, Trash2, Loader2, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Permission categories for grouping
const PERMISSION_CATEGORIES = {
    machines: { label: 'Machines', icon: '🔧' },
    workorders: { label: 'Ordres de travail', icon: '📋' },
    clients: { label: 'Clients', icon: '👥' },
    inventory: { label: 'Inventaire', icon: '📦' },
    technicians: { label: 'Techniciens', icon: '👷' },
    admin: { label: 'Administration', icon: '⚙️' },
};

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '', displayName: '', description: '', permissions: [],
    });

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/roles');
            setRoles(response.data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/roles/permissions?grouped=true');
            setPermissions(response.data || {});
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    const handleOpenDialog = (role = null) => {
        setSelectedRole(role);
        if (role) {
            setFormData({
                name: role.name,
                displayName: role.displayName,
                description: role.description || '',
                permissions: role.permissions || [],
            });
        } else {
            setFormData({ name: '', displayName: '', description: '', permissions: [] });
        }
        setShowDialog(true);
    };

    const handlePermissionToggle = (permKey) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permKey)
                ? prev.permissions.filter(p => p !== permKey)
                : [...prev.permissions, permKey],
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (selectedRole) {
                await api.put(`/roles/${selectedRole.id}`, formData);
                toast.success('Rôle modifié');
            } else {
                await api.post('/roles', formData);
                toast.success('Rôle créé');
            }
            setShowDialog(false);
            fetchRoles();
        } catch (error) {
            console.error('Error saving role:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (roleId) => {
        if (!confirm('Supprimer ce rôle ?')) return;
        try {
            await api.delete(`/roles/${roleId}`);
            toast.success('Rôle supprimé');
            fetchRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="h-8 w-8" /> Rôles & Permissions
                    </h1>
                    <p className="text-muted-foreground">Configurez les niveaux d'accès</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" /> Nouveau rôle
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <Card key={role.id} className={role.isSystem ? 'border-primary/50' : ''}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {role.isSystem && <Lock className="h-4 w-4 text-primary" />}
                                        {role.displayName}
                                    </CardTitle>
                                    {!role.isSystem && (
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(role)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive"
                                                onClick={() => handleDelete(role.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <CardDescription>{role.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions?.includes('*') ? (
                                        <Badge className="bg-green-500">Accès complet</Badge>
                                    ) : role.permissions?.length > 0 ? (
                                        <>
                                            <Badge variant="secondary">{role.permissions.length} permissions</Badge>
                                        </>
                                    ) : (
                                        <Badge variant="outline">Aucune permission</Badge>
                                    )}
                                </div>
                                {role.isSystem && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Rôle système - non modifiable
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Role Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedRole ? 'Modifier le rôle' : 'Nouveau rôle'}</DialogTitle>
                        <DialogDescription>
                            Configurez les permissions pour ce rôle
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Identifiant *</Label>
                                <Input value={formData.name} disabled={!!selectedRole}
                                    placeholder="ex: super_technician"
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Nom affiché *</Label>
                                <Input value={formData.displayName}
                                    placeholder="ex: Super Technicien"
                                    onChange={(e) => setFormData(p => ({ ...p, displayName: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description}
                                placeholder="Description du rôle..."
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                        </div>

                        {/* Permissions */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Permissions</Label>
                            {Object.entries(PERMISSION_CATEGORIES).map(([category, config]) => (
                                <div key={category} className="space-y-2">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <span>{config.icon}</span> {config.label}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 pl-6">
                                        {permissions[category]?.map((perm) => (
                                            <div key={perm.key} className="flex items-center space-x-2">
                                                <Checkbox id={perm.key}
                                                    checked={formData.permissions.includes(perm.key)}
                                                    onCheckedChange={() => handlePermissionToggle(perm.key)} />
                                                <label htmlFor={perm.key} className="text-sm cursor-pointer">
                                                    {perm.displayName}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
                        <Button onClick={handleSubmit} disabled={saving || !formData.name || !formData.displayName}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {selectedRole ? 'Enregistrer' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
