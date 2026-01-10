import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode, Download, Printer, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Machine QR Code display component with download and print functionality
 */
export function MachineQRCode({ machineId, machineName }) {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (machineId) {
            fetchQRCode();
        }
    }, [machineId]);

    const fetchQRCode = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/machines/${machineId}/qrcode-data`);
            setQrData(response.data);
        } catch (error) {
            console.error('Error fetching QR code:', error);
            toast.error('Erreur lors du chargement du QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format = 'png') => {
        try {
            const response = await api.get(`/machines/${machineId}/qrcode?format=${format}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-${machineName || machineId}.${format}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('QR code téléchargé');
        } catch (error) {
            console.error('Error downloading QR code:', error);
            toast.error('Erreur lors du téléchargement');
        }
    };

    const handlePrint = async () => {
        try {
            const response = await api.get(`/machines/${machineId}/qrcode?format=png`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code - ${machineName || machineId}</title>
                        <style>
                            body { 
                                display: flex; 
                                flex-direction: column;
                                align-items: center; 
                                justify-content: center; 
                                min-height: 100vh;
                                font-family: system-ui, sans-serif;
                                margin: 0;
                                padding: 20px;
                            }
                            img { max-width: 300px; }
                            h2 { margin-bottom: 10px; }
                            p { color: #666; margin: 5px 0; }
                        </style>
                    </head>
                    <body>
                        <h2>${machineName || 'Machine'}</h2>
                        <img src="${url}" />
                        <p>ID: ${machineId}</p>
                        <p>Scannez pour accéder à la fiche machine</p>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
            };
        } catch (error) {
            console.error('Error printing QR code:', error);
            toast.error('Erreur lors de l\'impression');
        }
    };

    const handleCopyUrl = () => {
        if (qrData?.url) {
            navigator.clipboard.writeText(qrData.url);
            setCopied(true);
            toast.success('URL copiée');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <Skeleton className="h-48 w-48" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!qrData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        QR Code
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-8">
                    Impossible de charger le QR code
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code
                </CardTitle>
                <CardDescription>
                    Scannez pour accéder rapidement à cette machine
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* QR Code Image */}
                <div className="flex justify-center">
                    {qrData.dataUrl ? (
                        <img
                            src={qrData.dataUrl}
                            alt={`QR Code - ${machineName}`}
                            className="w-48 h-48 border rounded-lg p-2 bg-white"
                        />
                    ) : (
                        <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-gray-50">
                            <QrCode className="h-16 w-16 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* URL Display */}
                {qrData.url && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-mono truncate flex-1">{qrData.url}</span>
                        <Button variant="ghost" size="sm" onClick={handleCopyUrl}>
                            {copied ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleDownload('png')}>
                        <Download className="h-4 w-4 mr-2" />
                        PNG
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleDownload('svg')}>
                        <Download className="h-4 w-4 mr-2" />
                        SVG
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimer
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
