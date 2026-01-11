import { Component } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log to error tracking service (e.g., Sentry)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <CardTitle className="text-xl">Une erreur s'est produite</CardTitle>
                            <CardDescription>
                                Nous sommes désolés, quelque chose s'est mal passé.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 overflow-auto max-h-32">
                                    <code>{this.state.error.toString()}</code>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Recharger
                                </Button>
                                <Button onClick={this.handleGoHome} className="flex-1">
                                    <Home className="h-4 w-4 mr-2" />
                                    Accueil
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
