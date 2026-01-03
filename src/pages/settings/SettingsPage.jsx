import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    Building2,
    Phone,
    Mail,
    MapPin,
    FileText,
    Save,
    Loader2,
    ArrowLeft,
    Globe,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        ice: '',
        rc: '',
        patente: '',
        if: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings/company');
                setFormData(response.data);
            } catch (error) {
                console.error('Error loading settings:', error);
                toast.error('Erreur lors du chargement des paramètres');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings/company', formData);
            toast.success('Paramètres enregistrés avec succès');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Paramètres
                    </h1>
                    <p className="text-muted-foreground">
                        Configuration de l'application et informations de l'entreprise
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Company Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            Informations de l'Entreprise
                        </CardTitle>
                        <CardDescription>
                            Ces informations apparaîtront sur les factures et documents générés
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    Nom de l'entreprise
                                </label>
                                <Input
                                    placeholder="MaintenancePro SARL"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="contact@entreprise.ma"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    Téléphone
                                </label>
                                <Input
                                    placeholder="+212 522 123 456"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    Site Web
                                </label>
                                <Input
                                    placeholder="https://www.entreprise.ma"
                                    value={formData.website || ''}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Adresse complète
                            </label>
                            <Textarea
                                placeholder="123 Boulevard Mohammed V, Casablanca 20000, Maroc"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                rows={2}
                            />
                        </div>

                        <Separator />

                        {/* Legal Info */}
                        <div>
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-amber-500" />
                                Informations Légales
                                <Badge variant="outline" className="ml-2">Obligatoire pour les factures</Badge>
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        ICE <span className="text-muted-foreground text-xs">(Identifiant Commun de l'Entreprise)</span>
                                    </label>
                                    <Input
                                        placeholder="001234567890123"
                                        value={formData.ice}
                                        onChange={(e) => handleInputChange('ice', e.target.value)}
                                        maxLength={15}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        RC <span className="text-muted-foreground text-xs">(Registre de Commerce)</span>
                                    </label>
                                    <Input
                                        placeholder="RC 123456"
                                        value={formData.rc}
                                        onChange={(e) => handleInputChange('rc', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Patente
                                    </label>
                                    <Input
                                        placeholder="12345678"
                                        value={formData.patente}
                                        onChange={(e) => handleInputChange('patente', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        IF <span className="text-muted-foreground text-xs">(Identifiant Fiscal)</span>
                                    </label>
                                    <Input
                                        placeholder="12345678"
                                        value={formData.if}
                                        onChange={(e) => handleInputChange('if', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 bg-slate-50 border-t">
                        <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Enregistrer les modifications
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            {/* Preview Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Aperçu sur Facture</CardTitle>
                    <CardDescription>Voici comment vos informations apparaîtront sur les documents</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-bold text-blue-800">{formData.name || 'Nom de l\'entreprise'}</h2>
                            <p className="text-sm text-muted-foreground">{formData.address || 'Adresse'}</p>
                            <p className="text-sm text-muted-foreground">
                                Tél: {formData.phone || '-'} | Email: {formData.email || '-'}
                            </p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs text-center border-t pt-4">
                            <div>
                                <span className="text-muted-foreground">ICE:</span><br />
                                <span className="font-mono">{formData.ice || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">RC:</span><br />
                                <span className="font-mono">{formData.rc || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Patente:</span><br />
                                <span className="font-mono">{formData.patente || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">IF:</span><br />
                                <span className="font-mono">{formData.if || '-'}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
