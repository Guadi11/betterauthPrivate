// components/ingresos/filtros-ingresos.tsx
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, X, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [solicitanteTerm, setSolicitanteTerm] = useState(searchParams.get('solicitante') || '');

  useEffect(() => {
    setSearchTerm(searchParams.get('query') || '');
    setSolicitanteTerm(searchParams.get('solicitante') || '');
  }, [searchParams]);

  const handleTextSearch = useDebouncedCallback((key: 'query' | 'solicitante', value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (value) params.set(key, value);
    else params.delete(key);
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
  };

  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <div className="space-y-4 mb-6 bg-white p-4 rounded-lg border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* 1. Visitante */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 space-y-1">
          <span className="text-xs font-medium text-muted-foreground ml-1">
            Datos del visitante
          </span>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nombre, DNI, tarjeta..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleTextSearch('query', e.target.value);
              }}
            />
          </div>
        </div>

        {/* 2. Solicitante */}
        <div className="col-span-1 md:col-span-6 lg:col-span-3 space-y-1">
          <span className="text-xs font-medium text-muted-foreground ml-1">
            Solicitante
          </span>
          <div className="relative">
            <UserCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Legajo o Nombre"
              className="pl-9"
              value={solicitanteTerm}
              onChange={(e) => {
                setSolicitanteTerm(e.target.value);
                handleTextSearch('solicitante', e.target.value);
              }}
            />
          </div>
        </div>

        {/* 3. Estado (Agregué label también para mantener la alineación visual perfecta) */}
        <div className="col-span-1 md:col-span-4 lg:col-span-2 space-y-1">
          <span className="text-xs font-medium text-muted-foreground ml-1">
            Estado
          </span>
          <Select 
            onValueChange={handleEstadoChange} 
            value={searchParams.get('estado') || 'todos'} 
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="abiertos">Solo Abiertos</SelectItem>
            </SelectContent>
          </Select>
        </div>

         {/* 4. Fechas */}
         <div className="col-span-1 md:col-span-12 lg:col-span-3 flex gap-2 w-full">
            <div className="flex-1 space-y-1">
                <span className="text-xs font-medium text-muted-foreground ml-1">Desde</span>
                <Input 
                    type="date" 
                    className="w-full text-xs px-2 block" 
                    onChange={(e) => handleDateChange('desde', e.target.value)}
                    value={searchParams.get('desde') || ''}
                />
            </div>
            <div className="flex-1 space-y-1">
                <span className="text-xs font-medium text-muted-foreground ml-1">Hasta</span>
                <Input 
                    type="date" 
                    className="w-full text-xs px-2 block"
                    onChange={(e) => handleDateChange('hasta', e.target.value)}
                    value={searchParams.get('hasta') || ''}
                    max={new Date().toISOString().split('T')[0]} 
                />
            </div>
         </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end border-t pt-2 mt-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8"
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}