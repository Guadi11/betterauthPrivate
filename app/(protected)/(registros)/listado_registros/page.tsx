import AccesoDenegado from "@/components/acceso-denegado";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";

import { obtenerTodosLosRegistros } from '@/lib/database/registros-queries';
import RegistrosTable from '@/components/registros/tabla-registros';

export default async function RegistrosPage() {
    const organizationId = ORGANIZATION_IDS.PERSONAL_VINCULACIONES;
        
    const accessResult = await checkOrganizationAccess({ organizationId });
        
    if(!accessResult.authorized){
        return <AccesoDenegado/>;
    }
    
    const registrosData = await obtenerTodosLosRegistros();
    
    return (
        <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Registros</h1>
        <RegistrosTable 
            initialData={registrosData} 
        />
        </div>
    );
}