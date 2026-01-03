import { ResponsiveBar } from '@nivo/bar';

export function TechnicianComparisonBar({ data }) {
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
            keys={['completed', 'inProgress', 'pending']}
            indexBy="name"
            margin={{ top: 20, right: 130, bottom: 50, left: 100 }}
            padding={0.3}
            layout="horizontal"
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#10b981', '#3b82f6', '#f59e0b']}
            borderRadius={3}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Interventions',
                legendPosition: 'middle',
                legendOffset: 40,
                truncateTickAt: 0
            }}
            axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: 0,
                truncateTickAt: 0
            }}
            enableLabel={true}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            legends={[
                {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemOpacity: 1
                            }
                        }
                    ]
                }
            ]}
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
                legends: {
                    text: {
                        fill: '#64748b',
                        fontSize: 11
                    }
                }
            }}
            tooltip={({ id, value, indexValue }) => (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                    <strong>{indexValue}</strong><br />
                    {id}: {value}
                </div>
            )}
        />
    );
}
