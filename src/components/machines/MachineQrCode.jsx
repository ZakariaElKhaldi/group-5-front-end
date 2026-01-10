import { useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Printer, Download, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MachineQrCode({ machine }) {
    const [loading, setLoading] = useState(false);

    const qrCodeUrl = `${import.meta.env.VITE_API_URL}/machines/${machine.id}/qrcode`;

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/machines/${machine.id}/qrcode?format=png`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `qrcode-${machine.reference}.png`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Erreur lors du téléchargement');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Étiquette Machine - ${machine.reference}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .label {
                            border: 2px solid #000;
                            padding: 20px;
                            text-align: center;
                            width: 300px;
                        }
                        img {
                            width: 200px;
                            height: 200px;
                        }
                        h1 { font-size: 24px; margin: 10px 0; }
                        p { font-size: 16px; margin: 5px 0; color: #555; }
                        .footer { margin-top: 10px; font-size: 12px; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="label">
                        <h1>${machine.reference}</h1>
                        <p>${machine.modele}</p>
                        <img src="${qrCodeUrl}?format=svg" />
                        <p class="footer">${machine.marque}</p>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Identification QR
                </CardTitle>
                <CardDescription>
                    Code unique pour l'identification rapide de la machine
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <img
                        src={`${qrCodeUrl}?format=svg`}
                        alt={`QR Code ${machine.reference}`}
                        className="w-48 h-48"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/200?text=QR+Error';
                        }}
                    />
                </div>

                <div className="flex gap-3 w-full">
                    <Button variant="outline" className="flex-1" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimer
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Télécharger
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
