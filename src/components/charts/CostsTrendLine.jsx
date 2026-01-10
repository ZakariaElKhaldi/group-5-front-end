import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

/**
 * CostsTrendLine - Shows costs trend over time using Recharts
 */
export function CostsTrendLine({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
            </div>
        );
    }

    // Transform data for Recharts
    const chartData = data.map(item => ({
        month: item.month,
        total: item.total || 0
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                    <strong>{label}</strong>: {payload[0].value.toFixed(2)}€
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 50, left: 60 }}>
                <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                />
                <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value) => `${value}€`}
                    label={{
                        value: 'Coûts (€)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: -45,
                        style: { fill: '#64748b', fontSize: 12 }
                    }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCost)"
                    dot={{ fill: '#ffffff', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: '#10b981', stroke: '#ffffff', strokeWidth: 2, r: 6 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
