import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, UserPlus, Shield, Loader2, Trash2, Eye, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // Tab state - filter by role
    const activeTab = searchParams.get('tab') || 'all';

    const [formData, setFormData] = useState({
        email: '', password: '', nom: '', prenom: '', roleId: '',
        // Technician-specific fields
        specialite: '', tauxHoraire: '', statut: 'Disponible',
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [search, activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: 100 });
            if (search) params.append('search', search);
            const response = await api.get(`/users?${params.toString()}`);
            let items = response.data.items || [];

            // Client-side filtering by role tab
            if (activeTab !== 'all') {
                items = items.filter(user => {
                    const roleName = user.role?.name?.toLowerCase();
                    if (activeTab === 'technicians') return roleName === 'technician';
                    if (activeTab === 'admins') return roleName === 'admin';
                    if (activeTab === 'receptionists') return roleName === 'receptionist';
                    return true;
                });
            }

            setUsers(items);
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

    const handleTabChange = (tab) => {
        const params = new URLSearchParams(searchParams);
        if (tab === 'all') {
            params.delete('tab');
        } else {
            params.set('tab', tab);
        }
        setSearchParams(params);
    };

    const isTechnicianRole = (roleId) => {
        const role = roles.find(r => r.id === parseInt(roleId));
        return role?.name === 'technician';
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
                // Load technician data if exists
                specialite: user.technicien?.specialite || '',
                tauxHoraire: user.technicien?.tauxHoraire?.toString() || '',
                statut: user.technicien?.statut || 'Disponible',
            });
        } else {
            setFormData({
                email: '', password: '', nom: '', prenom: '', roleId: '',
                specialite: '', tauxHoraire: '', statut: 'Disponible',
            });
        }
        setShowDialog(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const roleId = formData.roleId ? parseInt(formData.roleId) : null;
            const isTech = isTechnicianRole(formData.roleId);

            if (selectedUser) {
                // Update user
                const userPayload = {
                    email: formData.email,
                    nom: formData.nom,
                    prenom: formData.prenom,
                };
                if (formData.password) userPayload.password = formData.password;

                await api.put(`/users/${selectedUser.id}`, userPayload);

                // Update role if changed
                if (roleId !== selectedUser.roleId) {
                    await api.put(`/users/${selectedUser.id}/role`, { roleId });
                }

                // Update technician profile if applicable
                if (isTech && selectedUser.technicien) {
                    await api.put(`/techniciens/${selectedUser.technicien.id}`, {
                        specialite: formData.specialite,
                        tauxHoraire: parseFloat(formData.tauxHoraire) || 50,
                        statut: formData.statut,
                    });
                }

                toast.success('Utilisateur modifié');
            } else {
                // Create user
                if (isTech) {
                    // Use technician endpoint which creates both user and profile
                    await api.post('/techniciens', {
                        email: formData.email,
                        password: formData.password || 'password123',
                        nom: formData.nom,
                        prenom: formData.prenom,
                        specialite: formData.specialite,
                        tauxHoraire: parseFloat(formData.tauxHoraire) || 50,
                        statut: formData.statut,
                    });
                } else {
                    // Regular user creation
                    await api.post('/users', {
                        email: formData.email,
                        password: formData.password,
                        nom: formData.nom,
                        prenom: formData.prenom,
                        roleId,
                    });
                }
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

    const getStatusBadge = (statut) => {
        const styles = {
            'Disponible': 'bg-green-100 text-green-700',
            'En intervention': 'bg-amber-100 text-amber-700',
            'Absent': 'bg-red-100 text-red-700',
        };
        return <Badge className={styles[statut] || 'bg-gray-100'}>{statut}</Badge>;
    };

    const showTechnicianColumns = activeTab === 'technicians' || activeTab === 'all';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Gestion des Utilisateurs
                    </h1>
                    <p className="text-muted-foreground">Gérez les comptes utilisateur et les profils techniciens</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <UserPlus className="h-4 w-4 mr-2" /> Ajouter
                </Button>
            </div>

            {/* Tabs for filtering */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList>
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="technicians">Techniciens</TabsTrigger>
                    <TabsTrigger value="admins">Administrateurs</TabsTrigger>
                    <TabsTrigger value="receptionists">Réceptionnistes</TabsTrigger>
                </TabsList>
            </Tabs>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher..." className="pl-8"
                                value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {users.length} utilisateur{users.length > 1 ? 's' : ''}
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
                                {showTechnicianColumns && <TableHead>Spécialité</TableHead>}
                                {showTechnicianColumns && <TableHead>Taux</TableHead>}
                                {activeTab === 'technicians' && <TableHead>Statut</TableHead>}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={showTechnicianColumns ? 7 : 4} className="text-center h-24">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={showTechnicianColumns ? 7 : 4} className="text-center h-24 text-muted-foreground">
                                        Aucun utilisateur trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => {
                                    const isTech = user.role?.name === 'technician';
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.nom} {user.prenom}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.role ? (
                                                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                                        {isTech ? <Wrench className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                                        {user.role.displayName}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Standard</Badge>
                                                )}
                                            </TableCell>
                                            {showTechnicianColumns && (
                                                <TableCell>
                                                    {isTech ? user.technicien?.specialite || '-' : '-'}
                                                </TableCell>
                                            )}
                                            {showTechnicianColumns && (
                                                <TableCell>
                                                    {isTech && user.technicien?.tauxHoraire
                                                        ? `${user.technicien.tauxHoraire} €/h`
                                                        : '-'}
                                                </TableCell>
                                            )}
                                            {activeTab === 'technicians' && (
                                                <TableCell>
                                                    {isTech && user.technicien
                                                        ? getStatusBadge(user.technicien.statut)
                                                        : '-'}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right">
                                                {isTech && user.technicien && (
                                                    <Button variant="ghost" size="sm"
                                                        onClick={() => navigate(`/techniciens/${user.technicien.id}`)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)}>
                                                    Modifier
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive"
                                                    onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* User Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Account Information */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h4 className="font-medium text-sm text-muted-foreground">Informations du compte</h4>
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
                                    placeholder={selectedUser ? 'Laisser vide pour ne pas changer' : 'password123'}
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

                        {/* Technician-specific fields - shown conditionally */}
                        {isTechnicianRole(formData.roleId) && (
                            <div className="space-y-4 p-4 border rounded-lg border-amber-200 bg-amber-50/50">
                                <h4 className="font-medium text-sm text-amber-700 flex items-center gap-2">
                                    <Wrench className="h-4 w-4" />
                                    Profil Technicien
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Spécialité</Label>
                                        <Input value={formData.specialite}
                                            placeholder="ex: Hydraulique, Électromécanique"
                                            onChange={(e) => setFormData(p => ({ ...p, specialite: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Taux Horaire (€)</Label>
                                        <Input type="number" step="0.01" value={formData.tauxHoraire}
                                            placeholder="50"
                                            onChange={(e) => setFormData(p => ({ ...p, tauxHoraire: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Statut</Label>
                                    <Select value={formData.statut}
                                        onValueChange={(v) => setFormData(p => ({ ...p, statut: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Disponible">Disponible</SelectItem>
                                            <SelectItem value="En intervention">En intervention</SelectItem>
                                            <SelectItem value="Absent">Absent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
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
