import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
    User,
    Lock,
    Mail,
    Shield,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Avatar from 'boring-avatars';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, isAdmin, isTechnicien, isReceptionist } = useAuth();
    const [loading, setLoading] = useState(false);

    // Password change state
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [changing, setChanging] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        if (passwords.newPassword.length < 8) {
            toast.error('Le nouveau mot de passe doit faire au moins 8 caractères');
            return;
        }

        setChanging(true);
        try {
            await api.patch('/me/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Mot de passe mis à jour avec succès');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.response?.data?.error || 'Erreur lors du changement de mot de passe');
        } finally {
            setChanging(false);
        }
    };

    const getRoleBadge = () => {
        if (isAdmin()) return { label: 'Administrateur', color: 'bg-red-100 text-red-700 border-red-200' };
        if (isTechnicien()) return { label: 'Technicien', color: 'bg-amber-100 text-amber-700 border-amber-200' };
        if (isReceptionist()) return { label: 'Réceptionniste', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        return { label: 'Utilisateur', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    };

    const role = getRoleBadge();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Mon Profil</h1>
                    <p className="text-muted-foreground">Gérez vos informations personnelles et votre sécurité</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* User Summary Card */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="text-center pb-2">
                            <div className="flex justify-center mb-4">
                                <Avatar
                                    size={80}
                                    name={user?.email || 'User'}
                                    variant="beam"
                                    colors={['#64748B', '#F59E0B', '#22C55E', '#3B82F6', '#EF4444']}
                                />
                            </div>
                            <CardTitle>{user?.nom} {user?.prenom}</CardTitle>
                            <CardDescription className="flex items-center justify-center mt-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${role.color}`}>
                                    {role.label}
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span>ID: #{user?.id}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                                <Lock className="h-4 w-4" />
                                Sécurité
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Pour garantir la sécurité de votre compte, utilisez un mot de passe robuste combinant lettres, chiffres et symboles.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Password Change Card */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-amber-500" />
                                Changer le mot de passe
                            </CardTitle>
                            <CardDescription>
                                Modifiez votre mot de passe pour sécuriser votre accès
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handlePasswordChange}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mot de passe actuel</label>
                                    <Input
                                        type="password"
                                        required
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                                        className="max-w-md"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nouveau mot de passe</label>
                                        <Input
                                            type="password"
                                            required
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirmer le mot de passe</label>
                                        <Input
                                            type="password"
                                            required
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Password criteria */}
                                <div className="pt-2 space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Critères du mot de passe :</p>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        {passwords.newPassword.length >= 8 ?
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> :
                                            <XCircle className="h-3.5 w-3.5 text-slate-300" />
                                        }
                                        <span className={passwords.newPassword.length >= 8 ? 'text-green-600' : 'text-slate-500'}>
                                            Au moins 8 caractères
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50 border-t pt-4">
                                <Button type="submit" disabled={changing} className="ml-auto">
                                    {changing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Mise à jour...
                                        </>
                                    ) : (
                                        'Mettre à jour le mot de passe'
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
