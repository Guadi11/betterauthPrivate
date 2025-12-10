'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, X } from 'lucide-react'; // Asumo que usas lucide-react (default en shadcn)

// Componentes de Shadcn UI
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

  // 1. Búsqueda (Debounce)
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) params.set('query', term);
    else params.delete('query');
    
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  // 2. Estado (Adaptado para Shadcn Select onValueChange)
  const handleEstadoChange = (valor: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    
    if (valor === 'todos') params.delete('estado');
    else params.set('estado', valor);
    
    replace(`${pathname}?${params.toString()}`);
  };

  // 3. Fechas
  const handleDateChange = (key: 'desde' | 'hasta', value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (value) params.set(key, value);
    else params.delete(key);
    
    replace(`${pathname}?${params.toString()}`);
  };

  // 4. Limpiar todo
  const clearFilters = () => {
    replace(pathname);
  };

  const hasActiveFilters = searchParams.get('query') || 
                           searchParams.get('estado') || 
                           searchParams.get('desde') || 
                           searchParams.get('hasta');

  return (
    <div className="space-y-4 mb-6">
      
      {/* Fila Superior: Búsqueda y Estado */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* Input de Búsqueda con Icono */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI, tarjeta o lugar..."
            className="pl-9"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get('query')?.toString()}
          />
        </div>

        {/* Select de Estado */}
        <div className="w-full sm:w-[200px]">
          <Select 
            onValueChange={handleEstadoChange} 
            defaultValue={searchParams.get('estado') || 'todos'}
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

      {/* Fila Inferior: Fechas y Botón de Limpiar */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="grid gap-1.5">
             <span className="text-xs font-medium text-muted-foreground ml-1">Desde</span>
             <Input 
                type="date" 
                className="w-full sm:w-[160px]"
                onChange={(e) => handleDateChange('desde', e.target.value)}
                defaultValue={searchParams.get('desde')?.toString()}
             />
          </div>

          <div className="grid gap-1.5">
             <span className="text-xs font-medium text-muted-foreground ml-1">Hasta</span>
             <Input 
                type="date" 
                className="w-full sm:w-[160px]"
                onChange={(e) => handleDateChange('hasta', e.target.value)}
                defaultValue={searchParams.get('hasta')?.toString()}
                max={new Date().toISOString().split('T')[0]} 
             />
          </div>
        </div>

        {/* Botón Reset (Solo visible si hay filtros) */}
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