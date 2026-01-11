import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * InterventionTypePie - Premium donut chart with modern styling
 */
export function InterventionTypePie({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                    </div>
                    <p className="text-sm">Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    // Premium color palette
    const COLORS = [
        { main: '#6366f1', light: '#818cf8' }, // Indigo
        { main: '#10b981', light: '#34d399' }, // Emerald
        { main: '#f59e0b', light: '#fbbf24' }, // Amber
        { main: '#ef4444', light: '#f87171' }, // Red
        { main: '#8b5cf6', light: '#a78bfa' }, // Violet
    ];

    // Transform and ensure proper data format
    const pieData = data.map((item, index) => ({
        name: item.type || 'Unknown',
        value: parseInt(item.count) || 0,
        color: COLORS[index % COLORS.length].main,
        lightColor: COLORS[index % COLORS.length].light,
    }));

    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div className="bg-slate-900 px-4 py-3 rounded-xl shadow-2xl border border-slate-700">
                    <p className="text-white font-medium text-sm">{data.name}</p>
                    <p className="text-slate-300 text-xs mt-1">
                        {data.value} interventions ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 25;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null;

        return (
            <text
                x={x}
                y={y}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="fill-slate-600 text-xs font-medium"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const CustomLegend = ({ payload }) => (
        <div className="flex justify-center gap-6 mt-4">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-slate-600">{entry.value}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 min-h-0" style={{ minHeight: '200px' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <PieChart>
                        <defs>
                            {pieData.map((entry, index) => (
                                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={entry.lightColor} stopOpacity={1} />
                                    <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                                </linearGradient>
                            ))}
                        </defs>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            innerRadius="55%"
                            outerRadius="85%"
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`url(#gradient-${index})`}
                                    className="drop-shadow-sm hover:drop-shadow-lg transition-all cursor-pointer"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <CustomLegend payload={pieData.map(d => ({ color: d.color, value: d.name }))} />
        </div>
    );
}
