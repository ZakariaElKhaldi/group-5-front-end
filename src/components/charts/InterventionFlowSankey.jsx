import { Sankey, Tooltip, Layer, Rectangle } from 'recharts';

/**
 * Intervention Flow Sankey - Shows flow from priority to type to status
 * Simplified implementation using Recharts Sankey
 */

// Custom node component
function SankeyNode({ x, y, width, height, index, payload }) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];
    return (
        <Layer key={`sankey-node-${index}`}>
            <Rectangle
                x={x}
                y={y}
                width={width}
                height={height}
                fill={colors[index % colors.length]}
                fillOpacity="0.9"
                rx={3}
                ry={3}
            />
            <text
                x={x < 200 ? x - 6 : x + width + 6}
                y={y + height / 2}
                textAnchor={x < 200 ? 'end' : 'start'}
                dominantBaseline="middle"
                className="text-xs fill-slate-600"
            >
                {payload.name} ({payload.value || 0})
            </text>
        </Layer>
    );
}

// Custom link component
function SankeyLink({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index }) {
    const gradientId = `sankeyGradient${index}`;
    return (
        <Layer key={`sankey-link-${index}`}>
            <defs>
                <linearGradient id={gradientId}>
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                </linearGradient>
            </defs>
            <path
                d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={linkWidth}
                strokeOpacity={0.5}
            />
        </Layer>
    );
}

export function InterventionFlowSankey({ data }) {
    if (!data || !data.nodes || data.nodes.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
            </div>
        );
    }

    // Convert data format for Recharts Sankey
    const sankeyData = {
        nodes: data.nodes.map((n, i) => ({ name: n.id })),
        links: data.links.map(l => ({
            source: data.nodes.findIndex(n => n.id === l.source),
            target: data.nodes.findIndex(n => n.id === l.target),
            value: l.value
        })).filter(l => l.source !== -1 && l.target !== -1)
    };

    return (
        <div className="w-full h-full">
            <Sankey
                width={500}
                height={300}
                data={sankeyData}
                node={<SankeyNode />}
                link={<SankeyLink />}
                nodePadding={40}
                margin={{ left: 80, right: 80, top: 20, bottom: 20 }}
            >
                <Tooltip />
            </Sankey>
        </div>
    );
}

/**
 * Generate sankey data from interventions
 * Shows flow: Priority -> Type -> Status
 */
export function generateInterventionFlowData(interventions) {
    if (!interventions || interventions.length === 0) {
        // Return sample data for demo
        return {
            nodes: [
                { id: 'Urgente' },
                { id: 'Elevee' },
                { id: 'Normale' },
                { id: 'Basse' },
                { id: 'Préventive' },
                { id: 'Corrective' },
                { id: 'Terminée' },
                { id: 'En cours' },
                { id: 'En attente' },
            ],
            links: [
                { source: 'Urgente', target: 'Corrective', value: 8 },
                { source: 'Urgente', target: 'Préventive', value: 2 },
                { source: 'Elevee', target: 'Corrective', value: 5 },
                { source: 'Elevee', target: 'Préventive', value: 3 },
                { source: 'Normale', target: 'Corrective', value: 4 },
                { source: 'Normale', target: 'Préventive', value: 10 },
                { source: 'Basse', target: 'Préventive', value: 6 },
                { source: 'Corrective', target: 'Terminée', value: 12 },
                { source: 'Corrective', target: 'En cours', value: 3 },
                { source: 'Corrective', target: 'En attente', value: 2 },
                { source: 'Préventive', target: 'Terminée', value: 15 },
                { source: 'Préventive', target: 'En cours', value: 4 },
                { source: 'Préventive', target: 'En attente', value: 2 },
            ]
        };
    }

    // Build real data from interventions
    const priorityToType = {};
    const typeToStatus = {};

    interventions.forEach(i => {
        const priority = i.priorite || 'Normale';
        const type = i.type || 'Corrective';
        const status = i.statut || 'En attente';

        // Priority -> Type
        const ptKey = `${priority}|${type}`;
        priorityToType[ptKey] = (priorityToType[ptKey] || 0) + 1;

        // Type -> Status
        const tsKey = `${type}|${status}`;
        typeToStatus[tsKey] = (typeToStatus[tsKey] || 0) + 1;
    });

    // Build nodes (unique values)
    const priorities = [...new Set(interventions.map(i => i.priorite || 'Normale'))];
    const types = [...new Set(interventions.map(i => i.type || 'Corrective'))];
    const statuses = [...new Set(interventions.map(i => i.statut || 'En attente'))];

    const nodes = [
        ...priorities.map(p => ({ id: `P: ${p}` })),
        ...types.map(t => ({ id: `T: ${t}` })),
        ...statuses.map(s => ({ id: `S: ${s}` })),
    ];

    // Build links
    const links = [];

    Object.entries(priorityToType).forEach(([key, value]) => {
        const [priority, type] = key.split('|');
        links.push({
            source: `P: ${priority}`,
            target: `T: ${type}`,
            value
        });
    });

    Object.entries(typeToStatus).forEach(([key, value]) => {
        const [type, status] = key.split('|');
        links.push({
            source: `T: ${type}`,
            target: `S: ${status}`,
            value
        });
    });

    return { nodes, links };
}
