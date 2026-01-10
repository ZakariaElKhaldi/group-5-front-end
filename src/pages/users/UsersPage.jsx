import { useState, useEffect } from 'react';
import api from '@/services/api';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, Search, UserPlus, Shield, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        email: '', password: '', nom: '', prenom: '', roleId: '',
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: 50 });
            if (search) params.append('search', search);
            const response = await api.get(`/users?${params.toString()}`);
            setUsers(response.data.items || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleOpenDialog = (user = null) => {
        setSelectedUser(user);
        if (user) {
            setFormData({
                email: user.email,
                password: '',
                nom: user.nom,
                prenom: user.prenom,
                roleId: user.roleId?.toString() || '',
            });
        } else {
            setFormData({ email: '', password: '', nom: '', prenom: '', roleId: '' });
        }
        setShowDialog(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const payload = {
                ...formData,
                roleId: formData.roleId ? parseInt(formData.roleId) : null,
            };
            if (!payload.password) delete payload.password;

            if (selectedUser) {
                await api.put(`/users/${selectedUser.id}`, payload);
                if (formData.roleId) {
                    await api.put(`/users/${selectedUser.id}/role`, { roleId: parseInt(formData.roleId) });
                }
                toast.success('Utilisateur modifié');
            } else {
                await api.post('/users', payload);
                toast.success('Utilisateur créé');
            }
            setShowDialog(false);
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Supprimer cet utilisateur ?')) return;
        try {
            await api.delete(`/users/${userId}`);
            toast.success('Utilisateur supprimé');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Users className="h-8 w-8" /> Utilisateurs
                    </h1>
                    <p className="text-muted-foreground">Gérez les comptes utilisateur</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <UserPlus className="h-4 w-4 mr-2" /> Ajouter
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher..." className="pl-8"
                                value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        Aucun utilisateur trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.nom} {user.prenom}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.role ? (
                                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                                    <Shield className="h-3 w-3" />
                                                    {user.role.displayName}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Standard</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)}>
                                                Modifier
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-destructive"
                                                onClick={() => handleDelete(user.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* User Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nom *</Label>
                                <Input value={formData.nom}
                                    onChange={(e) => setFormData(p => ({ ...p, nom: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Prénom *</Label>
                                <Input value={formData.prenom}
                                    onChange={(e) => setFormData(p => ({ ...p, prenom: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input type="email" value={formData.email}
                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>{selectedUser ? 'Nouveau mot de passe' : 'Mot de passe *'}</Label>
                            <Input type="password" value={formData.password}
                                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Rôle</Label>
                            <Select value={formData.roleId || '__none__'}
                                onValueChange={(v) => setFormData(p => ({ ...p, roleId: v === '__none__' ? '' : v }))}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Standard</SelectItem>
                                    {roles.map(role => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.displayName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
                        <Button onClick={handleSubmit} disabled={saving || !formData.email || !formData.nom}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {selectedUser ? 'Enregistrer' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
