import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Smartphone, Copy, Check, RefreshCw, Camera, X, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/services/api';

/**
 * Mobile photo link component that integrates with the backend photo session API.
 * Creates a photo session, displays QR code, and polls for uploaded photos.
 *
 * @param {function} onPhotosReceived - Called with array of image URLs when photos arrive
 * @param {string} entityType - 'machine' or 'workorder'
 * @param {string} buttonLabel - Custom button text
 */
export default function MobilePhotoLink({
    onPhotosReceived,
    entityType = 'workorder',
    buttonLabel = "📱 Prendre des photos avec mobile"
}) {
    const [open, setOpen] = useState(false);
    const [session, setSession] = useState(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, waiting, completed
    const [timeRemaining, setTimeRemaining] = useState(0);
    const pollInterval = useRef(null);
    const timerInterval = useRef(null);

    // Create a new session when dialog opens
    const createSession = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.post('/photo-sessions', {
                entityType,
                context: { createdFrom: 'web' },
            });
            setSession(response.data);
            setStatus('waiting');

            // Calculate time remaining
            const expiresAt = new Date(response.data.expiresAt);
            const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setTimeRemaining(remaining);

            startPolling(response.data.sessionCode);
            startTimer();
        } catch (error) {
            console.error('Failed to create photo session:', error);
            toast.error('Erreur lors de la création de la session');
        } finally {
            setLoading(false);
        }
    }, [entityType]);

    // Start polling for photos
    const startPolling = (sessionCode) => {
        pollInterval.current = setInterval(async () => {
            try {
                const response = await api.get(`/photo-sessions/${sessionCode}`);
                const { status: sessionStatus, images } = response.data;

                if (sessionStatus === 'completed' && images && images.length > 0) {
                    // Photos received!
                    const imageObjects = images.map((url, index) => ({
                        id: `mobile-${Date.now()}-${index}`,
                        preview: url,
                        file: null,
                        source: 'mobile',
                    }));
                    onPhotosReceived(imageObjects);
                    toast.success(`${images.length} photo(s) reçue(s) du mobile !`);
                    setStatus('completed');
                    stopPolling();

                    // Close dialog after a short delay
                    setTimeout(() => setOpen(false), 1500);
                } else if (sessionStatus === 'expired') {
                    toast.error('Session expirée');
                    stopPolling();
                    setStatus('idle');
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 2000);
    };

    // Timer countdown
    const startTimer = () => {
        timerInterval.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    stopPolling();
                    setStatus('idle');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopPolling = () => {
        if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
        }
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }
    };

    // Cleanup on unmount or close
    useEffect(() => {
        if (open) {
            createSession();
        } else {
            stopPolling();
            setSession(null);
            setStatus('idle');
        }
        return () => stopPolling();
    }, [open, createSession]);

    const handleCopy = async () => {
        if (!session?.qrData) return;
        try {
            await navigator.clipboard.writeText(session.qrData);
            setCopied(true);
            toast.success('Lien copié !');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Erreur lors de la copie');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="gap-2">
                    <Smartphone className="h-4 w-4" />
                    {buttonLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Prendre des photos avec votre mobile
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : status === 'completed' ? (
                        <div className="flex flex-col items-center justify-center py-8 text-green-600">
                            <CheckCircle className="h-16 w-16 mb-4" />
                            <p className="font-medium">Photos reçues !</p>
                        </div>
                    ) : session ? (
                        <>
                            {/* Instructions */}
                            <p className="text-sm text-muted-foreground">
                                Scannez ce QR code avec l'application mobile GMAO pour prendre des photos.
                            </p>

                            {/* QR Code */}
                            <Card className="bg-white">
                                <CardContent className="p-6 flex items-center justify-center">
                                    <QRCodeSVG
                                        value={session.qrData}
                                        size={200}
                                        level="M"
                                        includeMargin
                                    />
                                </CardContent>
                            </Card>

                            {/* Timer and status */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    En attente des photos...
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {formatTime(timeRemaining)}
                                </div>
                            </div>

                            {/* Link to copy */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={session.qrData}
                                    readOnly
                                    className="flex-1 px-3 py-2 text-xs bg-muted rounded-md overflow-hidden text-ellipsis"
                                />
                                <Button type="button" size="sm" onClick={handleCopy}>
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            Erreur de connexion
                        </div>
                    )}

                    {/* Cancel */}
                    <div className="flex justify-end">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            <X className="h-4 w-4 mr-2" /> Fermer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
