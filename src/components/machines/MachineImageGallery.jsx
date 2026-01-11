import { useState, useRef } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Image as ImageIcon, Plus, Trash2, Star, Upload, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import MobilePhotoLink from '@/components/workorders/MobilePhotoLink';

export default function MachineImageGallery({ machine, onUpdate }) {
    const [uploading, setUploading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleMobilePhotos = async (photos) => {
        try {
            const imageUrls = photos.map(p => p.preview);
            await api.post(`/machines/${machine.id}/images/link`, { images: imageUrls });
            toast.success('Photos mobiles ajoutées !');
            onUpdate();
        } catch (error) {
            console.error('Mobile link error:', error);
            toast.error("Erreur lors de l'ajout des photos");
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            await api.post(`/machines/${machine.id}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Images téléchargées avec succès');
            setUploadDialogOpen(false);
            setSelectedFiles([]);
            onUpdate(); // Refresh machine data
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Erreur lors du téléchargement');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageUrl) => {
        try {
            await api.delete(`/machines/${machine.id}/images`, {
                data: { imageUrl }
            });
            toast.success('Image supprimée');
            onUpdate();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleSetPrimary = async (imageUrl) => {
        try {
            await api.put(`/machines/${machine.id}/primary-image`, { imageUrl });
            toast.success('Image principale mise à jour');
            onUpdate();
        } catch (error) {
            console.error('Set primary error:', error);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const images = machine.images || [];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Galerie Photos
                    </CardTitle>
                    <CardDescription>
                        Gérez les photos de la machine ({images.length} images)
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <MobilePhotoLink
                        onPhotosReceived={handleMobilePhotos}
                        entityType="machine"
                        buttonLabel="📱 Mobile"
                    />
                    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter des photos</DialogTitle>
                                <DialogDescription>
                                    Sélectionnez une ou plusieurs images à télécharger.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid w-full max-w-sm items-center gap-1.5 py-4">
                                <div
                                    className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        Cliquez pour sélectionner des fichiers
                                    </p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm bg-secondary p-2 rounded">
                                                <span className="truncate max-w-[200px]">{file.name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFiles(files => files.filter((_, i) => i !== index));
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
                                    {uploading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4 mr-2" />
                                    )}
                                    Télécharger
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {images.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune image disponible</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((url, index) => {
                            const isPrimary = url === machine.primaryImage;
                            return (
                                <div key={index} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border">
                                    <img
                                        src={url}
                                        alt={`Machine ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300?text=Error';
                                        }}
                                    />

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            variant={isPrimary ? "default" : "secondary"}
                                            size="icon"
                                            className={isPrimary ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                            title={isPrimary ? "Image principale" : "Définir comme principale"}
                                            onClick={() => !isPrimary && handleSetPrimary(url)}
                                            disabled={isPrimary}
                                        >
                                            <Star className={`h-4 w-4 ${isPrimary ? "fill-current" : ""}`} />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" title="Supprimer">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action est irréversible.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(url)}>
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>

                                    {/* Primary Badge */}
                                    {isPrimary && (
                                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-current" />
                                            Principale
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
