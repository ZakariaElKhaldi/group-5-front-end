import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

/**
 * StatusDistributionBar - Horizontal bar chart showing work order status distribution
 * Replaces the complex Sankey diagram with a cleaner, more interpretable visualization
 */
export function StatusDistributionBar({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-sm">Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    // Status color mapping with modern palette
    const statusColors = {
        'Signalé': { main: '#f59e0b', bg: '#fef3c7' },
        'Assigné': { main: '#3b82f6', bg: '#dbeafe' },
        'En cours': { main: '#8b5cf6', bg: '#ede9fe' },
        'Attente pièces': { main: '#f97316', bg: '#ffedd5' },
        'Terminé': { main: '#10b981', bg: '#d1fae5' },
        'Annulé': { main: '#6b7280', bg: '#f3f4f6' },
    };

    const chartData = data.map(item => ({
        ...item,
        color: statusColors[item.status]?.main || '#94a3b8',
        bgColor: statusColors[item.status]?.bg || '#f1f5f9',
    }));

    const total = chartData.reduce((sum, item) => sum + item.count, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.count / total) * 100).toFixed(1);
            return (
                <div className="bg-slate-900 px-4 py-3 rounded-xl shadow-2xl border border-slate-700">
                    <p className="text-white font-medium text-sm">{data.status}</p>
                    <p className="text-slate-300 text-xs mt-1">
                        {data.count} ordres ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full" style={{ minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 20, right: 30, top: 10, bottom: 10 }}
                    barCategoryGap={12}
                >
                    <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                        type="category"
                        dataKey="status"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                        width={100}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }} />
                    <Bar
                        dataKey="count"
                        radius={[0, 6, 6, 0]}
                        maxBarSize={32}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                className="drop-shadow-sm"
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Keep the old export name for backwards compatibility but it's now deprecated
export { StatusDistributionBar as InterventionFlowSankey };

// Empty function for backwards compatibility
export function generateInterventionFlowData() {
    return { nodes: [], links: [] };
}
