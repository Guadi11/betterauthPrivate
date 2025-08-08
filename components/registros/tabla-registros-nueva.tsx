import { obtenerRegistrosFiltradosPaginado } from "@/lib/database/registros-queries";
import { Pencil, UserRound } from 'lucide-react';
import Link from "next/link";

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
                {/*Version Mobile*/}
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
                                {registro.observacion_cc && (
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    Observacion CC
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
                                {/* Acceder */}
                                <Link
                                    href={`/registro/${registro.documento}`}
                                    className="group relative rounded-md border p-2 hover:bg-gray-100"
                                >
                                    <UserRound className="h-4 w-4 text-gray-500" />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                    Acceder
                                    </span>
                                </Link>

                                {/* Editar */}
                                <Link
                                    href={`/registro/${registro.documento}/editar`}
                                    className="group relative rounded-md border p-2 hover:bg-gray-100"
                                >
                                    <Pencil className="h-4 w-4 text-gray-500" />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                    Editar
                                    </span>
                                </Link>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                {/*Version de Escritorio*/}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full text-gray-900">
                            <thead className="rounded-lg text-left text-sm font-normal md:text-xs">
                            <tr>
                                <th scope="col" className="px-4 py-4 font-medium sm:pl-6">Nombre y Apellido</th>
                                <th scope="col" className="px-3 py-4 font-medium">Documento</th>

                                {/* Ocultas en md, visibles desde lg */}
                                <th scope="col" className="px-3 py-4 font-medium hidden lg:table-cell">Nacionalidad</th>
                                <th scope="col" className="px-3 py-4 font-medium hidden lg:table-cell">Fecha de Nacimiento</th>

                                {/* Ocultas hasta xl */}
                                <th scope="col" className="px-3 py-4 font-medium hidden xl:table-cell">Domicilio Real</th>
                                <th scope="col" className="px-3 py-4 font-medium hidden xl:table-cell">Observacion CC</th>

                                <th scope="col" className="px-3 py-4 font-medium text-center">Acciones</th>
                            </tr>
                            </thead>

                            <tbody className="bg-white">
                            {registros?.map((registro) => (
                                <tr
                                key={registro.documento}
                                className="w-full border-b py-2 last-of-type:border-none
                                            [&:first-child>td:first-child]:rounded-tl-lg
                                            [&:first-child>td:last-child]:rounded-tr-lg
                                            [&:last-child>td:first-child]:rounded-bl-lg
                                            [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                <td className="whitespace-nowrap py-2 pl-6 pr-3">
                                    <div className="flex items-center gap-3">
                                    <p>{registro.apellido}, {registro.nombre}</p>
                                    </div>
                                </td>

                                <td className="whitespace-nowrap px-3 py-2">
                                    {registro.tipo_documento}: {registro.documento}
                                </td>

                                {/* lg+ */}
                                <td className="whitespace-nowrap px-3 py-2 hidden lg:table-cell">
                                    {registro.nacionalidad || 'Sin especificar'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 hidden lg:table-cell">
                                    {registro.fecha_nacimiento
                                    ? new Date(registro.fecha_nacimiento).toLocaleDateString()
                                    : 'Sin especificar'}
                                </td>

                                {/* xl+ */}
                                <td className="whitespace-nowrap px-3 py-2 hidden xl:table-cell">
                                    {registro.domicilio_real || 'Sin especificar'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 hidden xl:table-cell">
                                    {registro.observacion_cc ? (
                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        Sí
                                    </span>
                                    ) : (
                                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                        No
                                    </span>
                                    )}
                                </td>

                                <td className="whitespace-nowrap px-3 py-2 text-center align-middle">
                                    <div className="inline-flex items-center justify-center gap-2">
                                    {/* Acceder */}
                                    <Link
                                        href={`/registro/${registro.documento}`}
                                        className="group relative rounded-md border p-2 hover:bg-gray-100"
                                    >
                                        <UserRound className="h-4 w-4 text-gray-500" />
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                        Acceder
                                        </span>
                                    </Link>

                                    {/* Editar */}
                                    <Link
                                        href={`/registro/${registro.documento}/editar`}
                                        className="group relative rounded-md border p-2 hover:bg-gray-100"
                                    >
                                        <Pencil className="h-4 w-4 text-gray-500" />
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                        Editar
                                        </span>
                                    </Link>
                                    </div>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}