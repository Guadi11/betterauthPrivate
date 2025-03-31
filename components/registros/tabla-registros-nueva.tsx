import { obtenerRegistrosFiltradosPaginado } from "@/lib/database/registros-queries";

export default async function RegistrosTable({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) {
    const registros = await obtenerRegistrosFiltradosPaginado(query, currentPage);

    return(
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                <div className="md:hidden">
                    {registros?.map((registro) => (
                    <div
                        key={registro.documento}
                        className="mb-2 w-full rounded-md bg-white p-4"
                    >
                        <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <div className="mb-2 flex items-center">
                            <p className="font-medium">{registro.apellido}, {registro.nombre}</p>
                            </div>
                            <p className="text-sm text-gray-500">{registro.tipo_documento}: {registro.documento}</p>
                        </div>
                        <div className="text-sm">
                            {registro.referido_cc && (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Referido CC
                            </span>
                            )}
                        </div>
                        </div>
                        <div className="flex w-full items-center justify-between pt-4">
                        <div>
                            <p className="text-sm text-gray-600">
                            {registro.nacionalidad || 'Sin nacionalidad'}
                            </p>
                            <p className="text-sm text-gray-600">
                            {registro.fecha_nacimiento 
                                ? new Date(registro.fecha_nacimiento).toLocaleDateString() 
                                : 'Sin fecha de nacimiento'}
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            {/* Aquí puedes agregar botones de acción como en el ejemplo original */}
                            <button className="rounded-md border p-2 hover:bg-gray-100">
                            <span className="sr-only">Editar</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-4 w-4 text-gray-500">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                            </svg>
                            </button>
                            <button className="rounded-md border p-2 hover:bg-gray-100">
                            <span className="sr-only">Eliminar</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-4 w-4 text-gray-500">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                            </button>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                <table className="hidden min-w-full text-gray-900 md:table">
                    <thead className="rounded-lg text-left text-sm font-normal">
                    <tr>
                        <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                        Nombre y Apellido
                        </th>
                        <th scope="col" className="px-3 py-5 font-medium">
                        Documento
                        </th>
                        <th scope="col" className="px-3 py-5 font-medium">
                        Nacionalidad
                        </th>
                        <th scope="col" className="px-3 py-5 font-medium">
                        Fecha de Nacimiento
                        </th>
                        <th scope="col" className="px-3 py-5 font-medium">
                        Domicilio Real
                        </th>
                        <th scope="col" className="px-3 py-5 font-medium">
                        Referido CC
                        </th>
                        <th scope="col" className="relative py-3 pl-6 pr-3">
                        <span className="sr-only">Acciones</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white">
                    {registros?.map((registro) => (
                        <tr
                        key={registro.documento}
                        className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                        >
                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                            <p>{registro.apellido}, {registro.nombre}</p>
                            </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {registro.tipo_documento}: {registro.documento}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {registro.nacionalidad || 'Sin especificar'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {registro.fecha_nacimiento 
                            ? new Date(registro.fecha_nacimiento).toLocaleDateString() 
                            : 'Sin especificar'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {registro.domicilio_real || 'Sin especificar'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                            {registro.referido_cc ? (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Sí
                            </span>
                            ) : (
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                No
                            </span>
                            )}
                        </td>
                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                            <div className="flex justify-end gap-3">
                            {/* Botones de acción */}
                            <button className="rounded-md border p-2 hover:bg-gray-100">
                                <span className="sr-only">Editar</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-4 w-4 text-gray-500">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                </svg>
                            </button>
                            <button className="rounded-md border p-2 hover:bg-gray-100">
                                <span className="sr-only">Eliminar</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-4 w-4 text-gray-500">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                            </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}