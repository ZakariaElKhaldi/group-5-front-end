import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Wrench,
    AlertTriangle,
    Users,
    Settings2,
    Euro,
    FileText,
} from 'lucide-react';

export function DashboardStats({ stats, loading }) {
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-1" />
                            <Skeleton className="h-3 w-[140px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        {
            title: 'Interventions',
            value: stats.interventions.total,
            description: `${stats.interventions.urgent} urgentes`,
            icon: FileText,
            color: 'text-blue-500',
        },
        {
            title: 'Techniciens Dispo',
            value: stats.techniciens.available,
            description: 'Prêts à intervenir',
            icon: Users,
            color: 'text-green-500',
        },
        {
            title: 'Machines',
            value: stats.machines.total,
            description: 'Parc total',
            icon: Settings2,
            color: 'text-gray-500',
        },
        {
            title: 'Coût Total',
            value: `${stats.costs.total} €`,
            description: 'Maintenance cumulée',
            icon: Euro,
            color: 'text-amber-500',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
