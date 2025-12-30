import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wrench, LogIn, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Connexion réussie');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Logo and branding */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">MaintenancePro</span>
                    </div>
                </div>

                {/* Main message */}
                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                        Gérez vos interventions<br />
                        <span className="text-white/80">en toute simplicité</span>
                    </h1>
                    <p className="text-lg text-white/70 max-w-md">
                        Plateforme complète de gestion de maintenance industrielle. Suivez vos machines, techniciens et interventions en temps réel.
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p className="text-white/50 text-sm">
                        © 2024 MaintenancePro. Tous droits réservés.
                    </p>
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-800">MaintenancePro</span>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Bienvenue
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Connectez-vous à votre compte
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Adresse email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="vous@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Mot de passe
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Connexion en cours...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Se connecter
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Test credentials */}
                    <div className="pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-400 text-center space-y-1">
                            <span className="block">Comptes de test :</span>
                            <span className="block font-mono text-slate-500">
                                Admin: admin@local.host / password
                            </span>
                            <span className="block font-mono text-slate-500">
                                Tech: tech@local.host / password
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
