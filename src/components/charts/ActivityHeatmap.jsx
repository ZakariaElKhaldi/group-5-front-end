import { ResponsiveHeatMap } from '@nivo/heatmap';

/**
 * Activity Heatmap - Shows intervention activity by day of week and hour
 * Data format: [{ id: "Lundi", data: [{ x: "8h", y: 5 }, ...] }, ...]
 */
export function ActivityHeatmap({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
            </div>
        );
    }

    return (
        <ResponsiveHeatMap
            data={data}
            margin={{ top: 60, right: 30, bottom: 30, left: 80 }}
            valueFormat=">-.0f"
            axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: '',
                legendOffset: 46,
                truncateTickAt: 0
            }}
            axisRight={null}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '',
                legendPosition: 'middle',
                legendOffset: -72,
                truncateTickAt: 0
            }}
            colors={{
                type: 'sequential',
                scheme: 'blues'
            }}
            emptyColor="#f1f5f9"
            borderRadius={3}
            borderWidth={2}
            borderColor="#ffffff"
            enableLabels={true}
            labelTextColor={{
                from: 'color',
                modifiers: [['darker', 2.5]]
            }}
            legends={[
                {
                    anchor: 'bottom',
                    translateX: 0,
                    translateY: 30,
                    length: 200,
                    thickness: 10,
                    direction: 'row',
                    tickPosition: 'after',
                    tickSize: 3,
                    tickSpacing: 4,
                    tickOverlap: false,
                    title: 'Interventions →',
                    titleAlign: 'start',
                    titleOffset: 4
                }
            ]}
            annotations={[]}
            hoverTarget="cell"
            tooltip={({ cell }) => (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                    <strong>{cell.serieId}</strong> à <strong>{cell.data.x}</strong><br />
                    {cell.formattedValue} intervention{cell.value > 1 ? 's' : ''}
                </div>
            )}
        />
    );
}

/**
 * Generate sample activity heatmap data
 * Returns data showing interventions by day of week and time slot
 */
export function generateActivityHeatmapData(interventions) {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const hours = ['8h', '9h', '10h', '11h', '12h', '14h', '15h', '16h', '17h'];

    // Initialize data structure
    const heatmapData = days.map(day => ({
        id: day,
        data: hours.map(hour => ({ x: hour, y: 0 }))
    }));

    if (!interventions || interventions.length === 0) {
        // Return sample data for demo
        return days.map(day => ({
            id: day,
            data: hours.map(hour => ({
                x: hour,
                y: Math.floor(Math.random() * 5)
            }))
        }));
    }

    // Process real intervention data
    interventions.forEach(intervention => {
        try {
            const date = new Date(intervention.dateDebut);
            const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
            const hour = date.getHours();

            // Map hour to our time slots
            let hourIndex = -1;
            if (hour >= 8 && hour <= 11) hourIndex = hour - 8;
            else if (hour >= 12 && hour <= 12) hourIndex = 4;
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
