import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Clock
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    parseISO,
    isToday
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Priority badge component (moved from deleted Badges.jsx)
function PriorityBadge({ priority }) {
    const variants = {
        'urgent': 'bg-red-100 text-red-700 border-red-200',
        'high': 'bg-amber-100 text-amber-700 border-amber-200',
        'normal': 'bg-blue-100 text-blue-700 border-blue-200',
        'low': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return (
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", variants[priority] || variants.normal)}>
            {priority}
        </span>
    );
}

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [workorders, setWorkorders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchWorkorders = async () => {
        setLoading(true);
        try {
            // Fetch work orders for calendar view
            const response = await api.get('/workorders?limit=500');
            setWorkorders(response.data.items || response.data || []);
        } catch (error) {
            console.error('Failed to fetch workorders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkorders();
    }, []);

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </h1>
                        <p className="text-muted-foreground">Planning des ordres de travail</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg bg-card overflow-hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none border-r h-10 w-10"
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            className="rounded-none px-4 h-10 font-medium"
                            onClick={() => setCurrentMonth(new Date())}
                        >
                            Aujourd'hui
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none border-l h-10 w-10"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                    <Button onClick={() => navigate('/workorders/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Nouvelle
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((day) => (
                    <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const dayWorkorders = workorders.filter(item => {
                    const scheduledDate = item.scheduledDate || item.dateDebut;
                    return scheduledDate && isSameDay(parseISO(scheduledDate), cloneDay);
                });

                days.push(
                    <div
                        key={day.toString()}
                        className={cn(
                            "min-h-[140px] border-t border-l p-2 bg-card transition-colors hover:bg-muted/30",
                            !isSameMonth(day, monthStart) ? "bg-muted/10 text-muted-foreground" : "",
                            isToday(day) ? "bg-primary/5" : ""
                        )}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                                "h-7 w-7 flex items-center justify-center rounded-full text-sm font-medium",
                                isToday(day) ? "bg-primary text-primary-foreground" : ""
                            )}>
                                {formattedDate}
                            </span>
                            {dayWorkorders.length > 0 && (
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                                    {dayWorkorders.length} OT
                                </span>
                            )}
                        </div>
                        <div className="space-y-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                            {dayWorkorders.map((wo) => (
                                <div
                                    key={wo.id}
                                    onClick={() => navigate(`/workorders/${wo.id}`)}
                                    className={cn(
                                        "text-[10px] p-1.5 rounded-md border flex flex-col gap-0.5 cursor-pointer shadow-sm transition-transform active:scale-95",
                                        wo.priority === 'urgent' ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" :
                                            wo.priority === 'high' ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" :
                                                "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                    )}
                                >
                                    <div className="font-bold flex justify-between items-center truncate">
                                        <span>#{wo.id} - {wo.machine?.modele || 'Machine'}</span>
                                        <Clock size={8} />
                                    </div>
                                    <span className="truncate opacity-80">{wo.title || wo.description || 'Ordre de travail'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 border-r border-b" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="rounded-xl border shadow-sm overflow-hidden">{rows}</div>;
    };

    return (
        <div className="h-full flex flex-col">
            {renderHeader()}
            <div className="flex-1 overflow-auto bg-background p-1">
                {renderDays()}
                {loading ? (
                    <div className="h-[600px] flex flex-col items-center justify-center border rounded-xl bg-card gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground animate-pulse">Chargement du planning...</p>
                    </div>
                ) : (
                    renderCells()
                )}
            </div>

            <div className="mt-6 flex gap-6 text-xs text-muted-foreground bg-card p-4 rounded-lg border border-dashed">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" />
                    <span>Urgent / Critique</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200" />
                    <span>Priorité Élevée</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200" />
                    <span>Corrective / Préventive</span>
                </div>
            </div>
        </div>
    );
}

