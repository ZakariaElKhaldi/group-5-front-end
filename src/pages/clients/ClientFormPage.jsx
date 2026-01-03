import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Phone, Mail, MapPin, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ClientFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);

    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        adresse: '',
        ice: '',
        rc: '',
        patente: '',
    });

    useEffect(() => {
        if (isEditing) {
            api.get(`/clients/${id}`)
                .then(res => {
                    setFormData({
                        nom: res.data.nom || '',
                        email: res.data.email || '',
                        telephone: res.data.telephone || '',
                        adresse: res.data.adresse || '',
                        ice: res.data.ice || '',
                        rc: res.data.rc || '',
                        patente: res.data.patente || '',
                    });
                })
                .catch(err => {
                    console.error('Error loading client:', err);
                    toast.error('Erreur lors du chargement du client');
                    navigate('/clients');
                })
                .finally(() => setInitialLoading(false));
        }
    }, [id, isEditing, navigate]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.nom.trim()) {
            toast.error('Le nom du client est requis');
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                await api.put(`/clients/${id}`, formData);
                toast.success('Client mis à jour avec succès');
            } else {
                await api.post('/clients', formData);
                toast.success('Client créé avec succès');
            }
            navigate('/clients');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.error || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {isEditing ? 'Modifier Client' : 'Nouveau Client'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditing ? 'Modifiez les informations du client' : 'Ajoutez un nouveau client au système'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            Informations de base
                        </CardTitle>
                        <CardDescription>
                            Informations essentielles du client
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Nom / Raison Sociale <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Ex: ABC Industries SARL"
                                value={formData.nom}
                                onChange={(e) => handleInputChange('nom', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="contact@client.ma"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    Téléphone
                                </label>
                                <Input
                                    placeholder="06 XX XX XX XX"
                                    value={formData.telephone}
                                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Adresse
                            </label>
                            <Textarea
                                placeholder="Adresse complète du client..."
                                value={formData.adresse}
                                onChange={(e) => handleInputChange('adresse', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Legal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-amber-500" />
                            Informations légales
                            <Badge variant="outline" className="ml-2 text-xs">
                                Pour facturation
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Ces informations apparaîtront sur les factures
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    ICE
                                    <span className="text-xs text-muted-foreground ml-1">
                                        (Identifiant Commun de l'Entreprise)
                                    </span>
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
                                    RC
                                    <span className="text-xs text-muted-foreground ml-1">
                                        (Registre du Commerce)
                                    </span>
                                </label>
                                <Input
                                    placeholder="RC 123456"
                                    value={formData.rc}
                                    onChange={(e) => handleInputChange('rc', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Patente
                                <span className="text-xs text-muted-foreground ml-1">
                                    (Taxe Professionnelle)
                                </span>
                            </label>
                            <Input
                                placeholder="12345678"
                                value={formData.patente}
                                onChange={(e) => handleInputChange('patente', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/clients')}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Enregistrer les modifications' : 'Créer le client'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
