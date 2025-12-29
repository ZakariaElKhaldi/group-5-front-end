import { useParams } from 'react-router-dom';

export default function MachineDetailPage() {
    const { id } = useParams();

    return (
        <div>
            <h1 className="text-2xl font-bold">Détails Machine #{id}</h1>
            <p>Historique des interventions à venir...</p>
        </div>
    );
}
