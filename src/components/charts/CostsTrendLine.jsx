import { ResponsiveLine } from '@nivo/line';

export function CostsTrendLine({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
            </div>
        );
    }

    // Transform data for Nivo line chart
    const lineData = [
        {
            id: 'Coûts',
            data: data.map(item => ({
                x: item.month,
                y: item.total || 0
            }))
        }
    ];

    return (
        <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
                type: 'linear',
                min: 0,
                max: 'auto',
                stacked: false,
                reverse: false
            }}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: '',
                legendOffset: 36,
                legendPosition: 'middle',
                truncateTickAt: 0
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Coûts (€)',
                legendOffset: -50,
                legendPosition: 'middle',
                truncateTickAt: 0,
                format: v => `${v}€`
            }}
            colors={['#10b981']}
            lineWidth={3}
            pointSize={8}
            pointColor="#ffffff"
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enableArea={true}
            areaOpacity={0.1}
            useMesh={true}
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
                },
                crosshair: {
                    line: {
                        stroke: '#3b82f6',
                        strokeWidth: 1,
                        strokeOpacity: 0.5
                    }
                }
            }}
            tooltip={({ point }) => (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                    <strong>{point.data.x}</strong>: {point.data.y.toFixed(2)}€
                </div>
            )}
        />
    );
}
