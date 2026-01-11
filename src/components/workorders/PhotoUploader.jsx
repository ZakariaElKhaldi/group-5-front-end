import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MobilePhotoLink from './MobilePhotoLink';

/**
 * Photo uploader component with drag-drop, preview, and immutability support
 * 
 * @param {string[]} images - Array of image URLs
 * @param {function} onImagesChange - Called when images array changes
 * @param {string} label - Label for the uploader
 * @param {boolean} required - Whether at least 1 photo is required
 * @param {boolean} readOnly - If true, cannot add or remove photos (immutable)
 * @param {number} maxImages - Maximum number of images allowed
 */
export default function PhotoUploader({
    images = [],
    onImagesChange,
    label = 'Photos',
    required = false,
    readOnly = false,
    maxImages = 5,
    showMobileOption = true,
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        if (!readOnly) setIsDragging(true);
    }, [readOnly]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        if (readOnly) return;

        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            processFiles(files);
        }
    }, [readOnly, images, maxImages]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            processFiles(files);
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const processFiles = async (files) => {
        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            toast.error(`Maximum ${maxImages} photos autorisées`);
            return;
        }

        const filesToProcess = files.slice(0, remainingSlots);
        setUploading(true);

        try {
            // Convert files to base64 data URLs for preview
            // (Actual upload to Cloudinary happens on form submit via backend)
            const newImages = await Promise.all(
                filesToProcess.map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve({
                            dataUrl: reader.result,
                            file: file, // Keep file reference for later upload
                            name: file.name,
                            isLocal: true, // Mark as not yet uploaded
                        });
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                })
            );

            onImagesChange([...images, ...newImages]);
            toast.success(`${newImages.length} photo(s) ajoutée(s)`);
        } catch (error) {
            console.error('Error processing images:', error);
            toast.error('Erreur lors du chargement des images');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (index) => {
        if (readOnly) return;
        const img = images[index];

        // Only allow removal of local (not yet uploaded) images
        if (!img.isLocal && !confirm('Cette photo est déjà enregistrée. Voulez-vous vraiment la supprimer?')) {
            return;
        }

        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const canAddMore = !readOnly && images.length < maxImages;
    const hasError = required && images.length === 0;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className={hasError ? 'text-destructive' : ''}>
                    {label} {required && '*'}
                    {required && images.length === 0 && (
                        <span className="text-destructive text-xs ml-2">(Au moins 1 photo requise)</span>
                    )}
                </Label>
                <span className="text-xs text-muted-foreground">
                    {images.length}/{maxImages}
                </span>
            </div>

            {/* Drop zone */}
            {canAddMore && (
                <Card
                    className={`
                        border-2 border-dashed p-6 text-center cursor-pointer transition-colors
                        ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                        ${hasError ? 'border-destructive/50' : ''}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span>Chargement...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-8 w-8" />
                            <div>
                                <span className="font-medium text-foreground">Glissez des images ici</span>
                                <span className="block text-sm">ou cliquez pour sélectionner</span>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Mobile photo option */}
            {canAddMore && showMobileOption && (
                <div className="flex justify-center">
                    <MobilePhotoLink
                        onPhotosReceived={(newImages) => {
                            onImagesChange([...images, ...newImages]);
                        }}
                        buttonLabel="📱 Prendre des photos avec mon téléphone"
                    />
                </div>
            )}

            {/* Image previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                        >
                            <img
                                src={img.dataUrl || img.url || img}
                                alt={img.name || `Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Local/uploaded indicator */}
                            {img.isLocal && (
                                <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1 rounded">
                                    Non enregistré
                                </div>
                            )}
                            {/* Remove button */}
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state with error */}
            {images.length === 0 && required && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Veuillez ajouter au moins une photo
                </div>
            )}
        </div>
    );
}

/**
 * Helper function to upload local images to backend
 * @param {number} entityId - The ID of the entity (machine or workorder)
 * @param {string} entityType - 'machine' or 'workorder'
 * @param {object[]} images - Array of image objects with file property
 * @param {object} api - Axios instance
 * @returns {Promise<string[]>} - Array of uploaded image URLs
 */
export async function uploadImagesToBackend(entityId, entityType, images, api) {
    const localImages = images.filter(img => img.isLocal && img.file);
    if (localImages.length === 0) return [];

    const formData = new FormData();
    localImages.forEach(img => {
        formData.append('images', img.file);
    });

    const endpoint = entityType === 'machine'
        ? `/machines/${entityId}/images`
        : `/workorders/${entityId}/images`;

    const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data.images || [];
}
