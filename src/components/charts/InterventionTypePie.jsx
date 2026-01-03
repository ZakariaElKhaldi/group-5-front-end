import { ResponsivePie } from '@nivo/pie';

export function InterventionTypePie({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
            </div>
        );
    }

    // Transform data for Nivo pie chart
    const pieData = data.map((item, index) => ({
        id: item.type,
        label: item.type,
        value: item.count,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]
    }));

    return (
        <ResponsivePie
            data={pieData}
            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
            innerRadius={0.5}
            padAngle={2}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            colors={{ datum: 'data.color' }}
            borderWidth={0}
            enableArcLinkLabels={true}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#64748b"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
            theme={{
                labels: {
                    text: {
                        fontSize: 12,
                        fontWeight: 600
                    }
                }
            }}
            tooltip={({ datum }) => (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                    <strong>{datum.label}</strong>: {datum.value} interventions
                </div>
            )}
        />
    );
}
