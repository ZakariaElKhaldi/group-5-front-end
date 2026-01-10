/**
 * Activity Heatmap - Shows activity by day of week and hour
 * Lightweight implementation using simple grid (no @nivo dependency)
 */

/**
 * ActivityHeatmap component - displays activity matrix using Recharts
 */
export function ActivityHeatmap({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
            </div>
        );
    }

    // Get hours from first day's data
    const hours = data[0]?.data?.map(d => d.x) || [];

    // Find max value for color scaling
    const maxValue = Math.max(...data.flatMap(d => d.data.map(h => h.y)));

    const getColor = (value) => {
        if (value === 0) return 'bg-slate-100';
        const intensity = Math.min(Math.floor((value / Math.max(maxValue, 1)) * 5), 5);
        const colors = [
            'bg-blue-100',
            'bg-blue-200',
            'bg-blue-300',
            'bg-blue-400',
            'bg-blue-500',
            'bg-blue-600',
        ];
        return colors[intensity] || 'bg-slate-100';
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Hour labels */}
            <div className="flex ml-20 mb-1">
                {hours.map(hour => (
                    <div key={hour} className="flex-1 text-xs text-center text-muted-foreground">
                        {hour}
                    </div>
                ))}
            </div>

            {/* Grid rows */}
            <div className="flex-1 flex flex-col gap-1">
                {data.map(day => (
                    <div key={day.id} className="flex items-center gap-1">
                        <div className="w-20 text-xs text-right pr-2 text-muted-foreground truncate">
                            {day.id}
                        </div>
                        <div className="flex-1 flex gap-1">
                            {day.data.map((cell, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 h-6 rounded-sm flex items-center justify-center text-xs font-medium transition-colors ${getColor(cell.y)} ${cell.y > 0 ? 'text-white' : 'text-slate-400'}`}
                                    title={`${day.id} à ${cell.x}: ${cell.y} intervention(s)`}
                                >
                                    {cell.y > 0 ? cell.y : ''}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center mt-3 gap-2 text-xs text-muted-foreground">
                <span>Moins</span>
                <div className="flex gap-0.5">
                    {['bg-slate-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600'].map((color, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${color}`} />
                    ))}
                </div>
                <span>Plus</span>
            </div>
        </div>
    );
}

/**
 * Generate activity heatmap data from interventions or work orders
 * Returns data showing activity by day of week and time slot
 * Supports both intervention.dateDebut and workorder.dateReported/dateStarted
 */
export function generateActivityHeatmapData(items) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const hours = ['8h', '9h', '10h', '11h', '12h', '14h', '15h', '16h', '17h'];

    // Initialize data structure
    const heatmapData = days.map(day => ({
        id: day,
        data: hours.map(hour => ({ x: hour, y: 0 }))
    }));

    if (!items || items.length === 0) {
        // Return sample data for demo when no data
        return days.map(day => ({
            id: day,
            data: hours.map(hour => ({
                x: hour,
                y: Math.floor(Math.random() * 5)
            }))
        }));
    }

    // Process real data - support both interventions and workorders
    items.forEach(item => {
        try {
            // Try multiple date fields: dateDebut (intervention), dateReported/dateStarted (workorder)
            const dateField = item.dateDebut || item.dateReported || item.dateStarted || item.scheduledDate;
            if (!dateField) return;

            const date = new Date(dateField);
            if (isNaN(date.getTime())) return;

            const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
            const hour = date.getHours();

            // Map hour to our time slots
            let hourIndex = -1;
            if (hour >= 8 && hour <= 11) hourIndex = hour - 8;
            else if (hour === 12) hourIndex = 4;
            else if (hour >= 14 && hour <= 17) hourIndex = hour - 9;

            if (hourIndex >= 0 && hourIndex < hours.length && dayIndex >= 0 && dayIndex < 7) {
                heatmapData[dayIndex].data[hourIndex].y += 1;
            }
        } catch (e) {
            // Skip invalid dates
        }
    });

    return heatmapData;
}
