import { ResponsiveSankey } from '@nivo/sankey';

/**
 * Intervention Flow Sankey - Shows flow from status to status or priority to type
 * Data format: { nodes: [{ id: "..." }], links: [{ source: "...", target: "...", value: N }] }
 */
export function InterventionFlowSankey({ data }) {
    if (!data || !data.nodes || data.nodes.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
            </div>
        );
    }

    return (
        <ResponsiveSankey
            data={data}
            margin={{ top: 20, right: 160, bottom: 20, left: 50 }}
            align="justify"
            colors={{ scheme: 'category10' }}
            nodeOpacity={1}
            nodeHoverOthersOpacity={0.35}
            nodeThickness={18}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderRadius={3}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            linkContract={3}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={16}
            labelTextColor={{
                from: 'color',
                modifiers: [['darker', 1]]
            }}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    translateX: 130,
                    itemWidth: 100,
                    itemHeight: 14,
                    itemDirection: 'left-to-right',
                    itemsSpacing: 2,
                    itemTextColor: '#64748b',
                    symbolSize: 12,
                    symbolShape: 'circle'
                }
            ]}
            tooltip={({ link }) => (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border text-sm">
                    <strong>{link.source.id}</strong> → <strong>{link.target.id}</strong><br />
                    {link.value} intervention{link.value > 1 ? 's' : ''}
                </div>
            )}
        />
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
