import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus, Loader2, Clock, User, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * NotesSection - Display and add progress notes on work orders
 */
export function NotesSection({ workOrderId, canEdit = false }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchNotes();
    }, [workOrderId]);

    const fetchNotes = async () => {
        try {
            const response = await api.get(`/workorders/${workOrderId}/notes`);
            setNotes(response.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error('Veuillez entrer un contenu');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/workorders/${workOrderId}/notes`, {
                content: newNote,
                isInternal,
            });
            toast.success('Note ajoutée');
            setNewNote('');
            setIsInternal(false);
            setShowAddForm(false);
            fetchNotes();
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
    };

    const getUserName = (user) => {
        if (user?.prenom && user?.nom) {
            return `${user.prenom} ${user.nom}`;
        }
        return user?.email?.split('@')[0] || 'Utilisateur';
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        Notes ({notes.length})
                    </CardTitle>
                    <CardDescription>
                        Historique des notes et mises à jour
                    </CardDescription>
                </div>
                {canEdit && !showAddForm && (
                    <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Note Form */}
                {showAddForm && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <Textarea
                            placeholder="Ajoutez une mise à jour sur l'avancement des travaux..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                            autoFocus
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="internal"
                                    checked={isInternal}
                                    onCheckedChange={setIsInternal}
                                />
                                <Label htmlFor="internal" className="text-sm flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    Note interne (non visible sur facture)
                                </Label>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setNewNote('');
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleAddNote}
                                    disabled={submitting || !newNote.trim()}
                                >
                                    {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                    Ajouter
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes List */}
                {loading ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Chargement...
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune note pour le moment</p>
                        {canEdit && (
                            <p className="text-sm mt-1">
                                Cliquez sur "Ajouter" pour documenter l'avancement
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="border rounded-lg p-3 bg-background hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium text-foreground">
                                            {getUserName(note.user)}
                                        </span>
                                        <span>•</span>
                                        <Clock className="h-3 w-3" />
                                        <span>{formatDate(note.created_at)}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {note.isInternal && (
                                            <Badge variant="outline" className="text-xs">
                                                <Lock className="h-3 w-3 mr-1" />
                                                Interne
                                            </Badge>
                                        )}
                                        {note.type !== 'note' && (
                                            <Badge variant="secondary" className="text-xs">
                                                {note.type === 'status_change' ? 'Statut' :
                                                    note.type === 'part_added' ? 'Pièce' :
                                                        note.type}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
