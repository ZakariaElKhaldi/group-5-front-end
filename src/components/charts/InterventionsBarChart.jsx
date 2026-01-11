import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * InterventionsBarChart - Shows interventions count by month using Recharts
 */
export function InterventionsBarChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                    <strong>{label}</strong>: {payload[0].value} interventions
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 50, left: 50 }}>
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
                    label={{
                        value: 'Interventions',
                        angle: -90,
                        position: 'insideLeft',
                        offset: -35,
                        style: { fill: '#64748b', fontSize: 12 }
                    }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
