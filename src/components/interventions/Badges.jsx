import { Badge } from "@/components/ui/badge"

const statusConfig = {
    'En attente': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'En attente' },
    'En cours': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'En cours' },
    'Terminee': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Terminée' },
    'Annulee': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Annulée' },
}

const priorityConfig = {
    'Basse': { color: 'bg-slate-100 text-slate-800 border-slate-200' },
    'Normale': { color: 'bg-blue-50 text-blue-700 border-blue-200' },
    'Urgente': { color: 'bg-red-50 text-red-700 border-red-200 animate-pulse' },
}

export function StatusBadge({ status }) {
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            {config.label}
        </span>
    );
}

export function PriorityBadge({ priority }) {
    const config = priorityConfig[priority] || { color: 'bg-gray-100', label: priority };
    return (
        <Badge variant="outline" className={`${config.color} border-none`}>
            {priority}
        </Badge>
    );
}
