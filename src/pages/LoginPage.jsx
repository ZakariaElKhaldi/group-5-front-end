import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, LogIn, Loader2, Eye, EyeOff, Shield, Zap, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

    const features = [
        { icon: Zap, title: 'Temps réel', desc: 'Suivi instantané des interventions' },
        { icon: BarChart3, title: 'Analytics', desc: 'Tableaux de bord intelligents' },
        { icon: Shield, title: 'Sécurisé', desc: 'Données protégées et cryptées' },
    ];

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Left side - Branding with animated background */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-600/20 to-red-500/20" />

                {/* Animated circles */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-1/2 -right-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-white">GMAO</span>
                            <span className="text-xs text-amber-400 block -mt-1">Maintenance Pro</span>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold text-white leading-tight">
                                Gérez votre<br />
                                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                                    maintenance
                                </span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-md">
                                Plateforme complète de gestion de maintenance industrielle.
                                Optimisez vos interventions et réduisez les temps d'arrêt.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid gap-4">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                        <feature.icon className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{feature.title}</p>
                                        <p className="text-sm text-slate-500">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-slate-600 text-sm">
                        © 2026 GMAO System. Tous droits réservés.
                    </p>
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-white">GMAO</span>
                            <span className="text-xs text-amber-400 block -mt-1">Maintenance Pro</span>
                        </div>
                    </div>

                    {/* Glass card */}
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-2xl font-bold text-white">
                                Bienvenue
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Connectez-vous à votre compte
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">
                                        Adresse email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="vous@exemple.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-300">
                                        Mot de passe
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20 pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Connexion...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5 mr-2" />
                                            Se connecter
                                        </>
                                    )}
                                </Button>
                            </form>


                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
