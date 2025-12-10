'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { ChangeEvent } from 'react';

export default function FiltrosIngresos() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // 1. Manejador de Búsqueda con Debounce
  // Espera 300ms después de que el usuario deja de escribir para actualizar la URL
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    
    // Siempre reseteamos a la página 1 al filtrar
    params.set('page', '1');

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    
    // replace actualiza la URL sin recargar la página completa
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  // 2. Manejador de Filtro de Estado (Sin debounce necesario)
  // Este se dispara inmediatamente al cambiar la opción
  const handleEstadoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    
    const val = e.target.value;
    if (val === 'todos') {
      params.delete('estado');
    } else {
      params.set('estado', val);
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  const handleDateChange = (key: 'desde' | 'hasta', value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Siempre resetear a página 1 al filtrar

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      
      {/* Input de Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <label htmlFor="search" className="sr-only">
          Buscar
        </label>
        <input
          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
          placeholder="Buscar por nombre, DNI, lugar o tarjeta..."
          // onChange llama a la función debounced
          onChange={(e) => handleSearch(e.target.value)}
          // defaultValue lee de la URL inicial para mantener el estado al recargar
          defaultValue={searchParams.get('query')?.toString()}
        />
        {/* Icono de Lupa */}
        <svg
            className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>

      {/* Select de Estado */}
      <div className="flex gap-2 items-center">
        <select
          className="block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 cursor-pointer bg-white"
          onChange={handleEstadoChange}
          defaultValue={searchParams.get('estado') || 'todos'}
        >
          <option value="todos">Todos los ingresos</option>
          <option value="abiertos">Solo ingresos abiertos</option>
        </select>
      </div>

      {/* Fila inferior: Filtros de Fecha */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 font-medium mr-2">Filtrar fecha:</span>
        
        <div className="flex items-center gap-2">
            <label htmlFor="desde" className="sr-only">Desde</label>
            <input
            type="date"
            id="desde"
            className="rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 text-gray-600"
            onChange={(e) => handleDateChange('desde', e.target.value)}
            defaultValue={searchParams.get('desde')?.toString()}
            />
        </div>

        <span className="text-gray-400">-</span>

        <div className="flex items-center gap-2">
            <label htmlFor="hasta" className="sr-only">Hasta</label>
            <input
            type="date"
            id="hasta"
            className="rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 text-gray-600"
            onChange={(e) => handleDateChange('hasta', e.target.value)}
            defaultValue={searchParams.get('hasta')?.toString()}
            max={new Date().toISOString().split('T')[0]} // Opcional: No permitir fechas futuras
            />
        </div>
        
        {/* Botón opcional para limpiar fechas si hay alguna seleccionada */}
        {(searchParams.get('desde') || searchParams.get('hasta')) && (
            <button
                onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('desde');
                    params.delete('hasta');
                    replace(`${pathname}?${params.toString()}`);
                }}
                className="text-xs text-red-600 hover:text-red-800 underline ml-2"
            >
                Limpiar fechas
            </button>
        )}
      </div>
    </div>
  );
}