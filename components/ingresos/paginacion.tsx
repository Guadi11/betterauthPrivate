// components/ingresos/paginacion.tsx
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Paginacion({ totalPages }: { totalPages: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-6">
      <button
        className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm"
        onClick={() => createPageURL(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Anterior
      </button>
      <span className="flex items-center px-4 text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </span>
      <button
        className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 text-sm"
        onClick={() => createPageURL(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Siguiente
      </button>
    </div>
  );
}