import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * TechnicianComparisonBar - Horizontal stacked bar chart comparing technicians
 */
export function TechnicianComparisonBar({ data }) {
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
                    <strong>{label}</strong>
                    {payload.map((p, i) => (
                        <div key={i} style={{ color: p.fill }}>
                            {p.name}: {p.value}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                <XAxis
                    type="number"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    width={90}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => {
                        const labels = {
                            completed: 'Terminées',
                            inProgress: 'En cours',
                            pending: 'En attente'
                        };
                        return labels[value] || value;
                    }}
                />
                <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="completed" />
                <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="inProgress" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} name="pending" />
            </BarChart>
        </ResponsiveContainer>
    );
}
