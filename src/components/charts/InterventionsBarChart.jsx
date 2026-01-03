import { ResponsiveBar } from '@nivo/bar';

export function InterventionsBarChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
            </div>
        );
    }

    return (
        <ResponsiveBar
            data={data}
            keys={['count']}
            indexBy="month"
            margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#3b82f6']}
            borderRadius={4}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: '',
                legendPosition: 'middle',
                legendOffset: 32,
                truncateTickAt: 0
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Interventions',
                legendPosition: 'middle',
                legendOffset: -40,
                truncateTickAt: 0
            }}
            enableLabel={false}
            theme={{
                axis: {
                    ticks: {
                        text: {
                            fill: '#64748b',
                            fontSize: 11
                        }
                    },
                    legend: {
                        text: {
                            fill: '#64748b',
                            fontSize: 12
                        }
                    }
                },
                grid: {
                    line: {
                        stroke: '#e2e8f0'
                    }
                }
            }}
            tooltip={({ indexValue, value }) => (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                    <strong>{indexValue}</strong>: {value} interventions
                </div>
            )}
        />
    );
}
