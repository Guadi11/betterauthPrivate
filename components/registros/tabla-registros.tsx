import { Registro } from '@/lib/database/registros-queries';
import Link from 'next/link';

interface RegistrosTableProps {
  initialData: Registro[];
}

export default function RegistrosTable({ 
  initialData, 
}: RegistrosTableProps) {

  return (
    <div>
      {/* Tabla de registros */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Acciones</th>
              <th className="border p-2">Documento</th>
              <th className="border p-2">Tipo Doc</th>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Apellido</th>
              <th className="border p-2">Fecha Nacimiento</th>
              <th className="border p-2">Nacionalidad</th>
            </tr>
          </thead>
          <tbody>
            {initialData.map((registro) => (
              <tr key={registro.documento} className="hover:bg-gray-50">
                <td className="border p-2">
                  <Link href={"/registro/"+registro.documento}>Acceder</Link>
                </td>
                <td className="border p-2">{registro.documento}</td>
                <td className="border p-2">{registro.tipo_documento}</td>
                <td className="border p-2">{registro.nombre}</td>
                <td className="border p-2">{registro.apellido}</td>
                <td className="border p-2">
                  {registro.fecha_nacimiento 
                    ? new Date(registro.fecha_nacimiento).toLocaleDateString() 
                    : 'N/A'}
                </td>
                <td className="border p-2">{registro.nacionalidad || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}