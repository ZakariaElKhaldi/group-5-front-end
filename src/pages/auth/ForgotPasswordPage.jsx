import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, ArrowLeft, Loader2, CheckCircle2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Veuillez entrer votre adresse email');
            return;
        }

        setLoading(true);
        try {
            await api.post('/password-reset-requests', { email, reason });
            setSubmitted(true);
        } catch (error) {
            toast.error('Erreur lors de l\'envoi de la demande');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-white">GMAO</span>
                        <span className="text-xs text-amber-400 block -mt-1">Maintenance Pro</span>
                    </div>
                </div>

                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold text-white">
                            {submitted ? 'Demande envoyée' : 'Mot de passe oublié'}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {submitted
                                ? 'Votre demande a été transmise à l\'équipe'
                                : 'Soumettez une demande de réinitialisation'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                                <p className="text-slate-300">
                                    Un administrateur examinera votre demande et vous contactera
                                    pour vous communiquer votre nouveau mot de passe.
                                </p>
                                <Link to="/login">
                                    <Button variant="outline" className="mt-4">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Retour à la connexion
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">
                                        Adresse email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="vous@exemple.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason" className="text-slate-300">
                                        Raison (optionnel)
                                    </Label>
                                    <Input
                                        id="reason"
                                        type="text"
                                        placeholder="Ex: J'ai oublié mon mot de passe"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="h-12 bg-white/5 border-white/20 text-white placeholder:text-slate-500"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Envoi...
                                        </>
                                    ) : (
                                        'Envoyer la demande'
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 inline mr-1" />
                                        Retour à la connexion
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
