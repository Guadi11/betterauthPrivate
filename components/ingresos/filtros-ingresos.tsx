'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react'; // <--- Importamos hooks

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FiltrosIngresos() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // 1. ESTADO LOCAL PARA EL INPUT
  // Inicializamos con lo que venga en la URL o cadena vacía
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');

  // 2. SINCRONIZACIÓN (El truco para el botón "Limpiar")
  // Si la URL cambia externamente (ej: click en limpiar), actualizamos el input local
  useEffect(() => {
    setSearchTerm(searchParams.get('query') || '');
  }, [searchParams]);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) params.set('query', term);
    else params.delete('query');
    
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleEstadoChange = (valor: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (valor === 'todos') params.delete('estado');
    else params.set('estado', valor);
    replace(`${pathname}?${params.toString()}`);
  };

  const handleDateChange = (key: 'desde' | 'hasta', value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (value) params.set(key, value);
    else params.delete(key);
    replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    replace(pathname);
    // El useEffect se encargará de limpiar el input visualmente
  };

  const hasActiveFilters = searchParams.get('query') || 
                           searchParams.get('estado') || 
                           searchParams.get('desde') || 
                           searchParams.get('hasta');

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* Input de Búsqueda Controlado */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI, tarjeta o lugar..."
            className="pl-9"
            value={searchTerm} // <--- Vinculado al estado local
            onChange={(e) => {
              setSearchTerm(e.target.value); // Actualiza UI inmediata
              handleSearch(e.target.value);  // Actualiza URL con debounce
            }}
          />
        </div>

        <div className="w-full sm:w-[200px]">
          <Select 
            onValueChange={handleEstadoChange} 
            // Usamos key para forzar re-render si el valor de la URL es null (para limpiar el select visualmente también)
            value={searchParams.get('estado') || 'todos'} 
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los ingresos</SelectItem>
              <SelectItem value="abiertos">Ingresos abiertos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="grid gap-1.5">
             <span className="text-xs font-medium text-muted-foreground ml-1">Desde</span>
             <Input 
                type="date" 
                className="w-full sm:w-[160px]"
                onChange={(e) => handleDateChange('desde', e.target.value)}
                // Para inputs date, defaultValue suele funcionar bien, 
                // pero si quieres que se limpien forzadamente, usa value={... || ''}
                value={searchParams.get('desde') || ''}
             />
          </div>

          <div className="grid gap-1.5">
             <span className="text-xs font-medium text-muted-foreground ml-1">Hasta</span>
             <Input 
                type="date" 
                className="w-full sm:w-[160px]"
                onChange={(e) => handleDateChange('hasta', e.target.value)}
                value={searchParams.get('hasta') || ''}
                max={new Date().toISOString().split('T')[0]} 
             />
          </div>
        </div>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}