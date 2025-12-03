# Documentación del Módulo: Auditoría de Impresión de Pases (PAT)
## 1. Visión General

Este módulo tiene como objetivo registrar de manera inalterable la intención de impresión de un Pase de Acceso Transitorio (PAT). Dado que el navegador no notifica si la impresión física fue exitosa, el sistema audita el momento en que se generó la vista previa de impresión y se enviaron los datos al spooler del sistema operativo.

### Objetivos Clave

* Trazabilidad: Saber quién, cuándo y qué diseño se utilizó.
* Integridad: Guardar una "foto" de los datos exactos que salieron en el pase (variables resueltas) en formato JSON, independientemente de cambios futuros en el registro de la persona.
* Seguridad: Garantizar que el usuario que figura en el log es el que tiene la sesión activa (backend-verified).
## 2. Arquitectura de Datos

Tabla: `log_impresion_pat`

Almacena el registro histórico de impresiones.

| Columna | Tipo |Descripción |
| :--- | :--- | :--- |
| id | bigint| Identificador único del evento (PK).| 
| pat_id | bigint | Referencia al Pase (pases_acceso_transitorio). |
| diseno_id | bigint | Referencia al Diseño usado (diseno_pat). | 
| impreso_por| text| ID del usuario que autorizó la impresión (obtenido de sesión). |
| impreso_en| timestamptz | Fecha y hora exacta del evento. |
| copias| integer | Cantidad de copias solicitadas (por defecto 1). |
| variables_resueltas| JSONB | Snapshot de los valores inyectados en el diseño (Nombre, DNI, Fechas, etc.). |

## 3. Flujo de Ejecución

El proceso sigue un patrón de Interceptación de Impresión en el lado del cliente, validado por una Server Action segura.
1. Renderizado: El usuario accede a la ruta de impresión. Konva genera el lienzo visual.
2. Intercepción: Al completarse la carga de imágenes y textos en el Canvas, el `useEffect` detecta que el `dataUrl` está listo.
3. Auditoría (Server-Side):
    * El cliente invoca `logPrintAttempt`.
    * El servidor verifica la sesión (`requireUserId`).
    * El servidor valida los datos con Zod.
    * Se inserta el registro en la base de datos.
4. Impresión (Client-Side):
    * Si la auditoría es exitosa, se invoca `window.print()` con un pequeño delay para asegurar el pintado del DOM.
    
# 4. Implementación del Código
## A. Server Action (lib/actions/log-impresion-actions.ts)
 Encargada de la validación y persistencia. Utiliza `zod` para validar el payload y `requireUserId` para la seguridad.

```typescript
'use server'

import { z } from 'zod';
import { query, isDatabaseError } from "@/lib/database/db";
import { requireUserId } from "@/lib/auth/session";

const LogImpresionSchema = z.object({
  pat_id: z.number(),
  diseno_id: z.string(),
  variables_resueltas: z.record(z.string()),
});

export type LogImpresionResult = 
  | { ok: true } 
  | { ok: false; error: string };

export async function logPrintAttempt(rawInput: z.infer<typeof LogImpresionSchema>): Promise<LogImpresionResult> {
  // 1. Verificación de Seguridad
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (e) {
    console.error("Intento de impresión sin sesión:", e);
    return { ok: false, error: "No se pudo verificar la sesión del usuario." };
  }

  // 2. Validación de Datos
  const validation = LogImpresionSchema.safeParse(rawInput);
  if (!validation.success) {
    return { ok: false, error: "Datos de impresión inválidos." };
  }

  const { pat_id, diseno_id, variables_resueltas } = validation.data;

  // 3. Persistencia
  const sql = `
    INSERT INTO log_impresion_pat 
      (pat_id, diseno_id, impreso_por, impreso_en, copias, variables_resueltas)
    VALUES 
      ($1, $2, $3, NOW(), 1, $4::jsonb)
  `;

  try {
    await query(sql, [
      pat_id,
      diseno_id,
      userId,
      JSON.stringify(variables_resueltas),
    ]);
    return { ok: true };
  } catch (err: unknown) {
    console.error("Error al auditar impresión:", err);
    if (isDatabaseError(err)) {
        return { ok: false, error: "Error de base de datos." };
    }
    return { ok: false, error: "Error desconocido." };
  }
}
```

# B. Cliente de Impresión (components/Pases/Imprimir/PrintPatClient.tsx)
Maneja la lógica visual (Konva) y el trigger de impresión."use client";
```typescript
import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva"; // Nota: Manejo de instancia window.Konva omitido por brevedad
import ImageNext from "next/image";
import { construirVarsDesdePat, type RenderVars } from "@/lib/pat/impresion/vars";
import { logPrintAttempt } from "@/lib/actions/log-impresion-actions";

// ... (Tipos Payload y RenderVars) ...

export default function PrintPatClient({ payload }: { payload: Payload }) {
  const { pat, diseno } = payload;
  const vars = useMemo(() => construirVarsDesdePat(pat), [pat]);
  
  // ... (Lógica de generación de dataUrl con Konva) ...
  
  const logEnviado = useRef(false);

  useEffect(() => {
    if (!dataUrl) return; // Esperar a que la imagen esté generada
    if (logEnviado.current) return; // Evitar doble ejecución (React Strict Mode)

    const procesarImpresion = async () => {
      logEnviado.current = true;

      // Auditar antes de abrir el diálogo
      await logPrintAttempt({
        pat_id: pat.id,
        diseno_id: diseno.id,
        variables_resueltas: vars as Record<string, string>,
      });

      // Retraso para asegurar renderizado en DOM
      setTimeout(() => {
        window.print();
      }, 100);
    };

    procesarImpresion();
  }, [dataUrl, pat.id, diseno.id, vars]);

  return (
    <div id="print-root">
       {/* Imagen renderizada oculta en pantalla pero visible en @media print */}
       {dataUrl && <ImageNext src={dataUrl} ... />}
    </div>
  );
}
```

# C. Página (app/.../imprimir/page.tsx)
Responsable de obtener los datos iniciales.

```typescript
export default async function PaginaImprimirPAT({ params, searchParams }: Props) {
  // ... Validaciones de ID y Diseño ...

  // Construcción del Payload limpio (sin datos de sesión expuestos)
  const payload = {
    pat,
    diseno: { /* ... datos del diseño ... */ },
  };

  return (
    <div className="p-4">
      <style>{/* CSS para @page size y ocultar UI */}</style>
      <PrintPatClient payload={payload} />
    </div>
  );
}
```

# 5. Consideraciones de Seguridad
1. **Identity Spoofing:** Se mitiga completamente al no aceptar el `userId` desde el cliente. La función `requireUserId()` extrae la identidad de la cookie de sesión encriptada en el servidor.
2. **Inyección SQL:** El uso de consultas parametrizadas ($1, $2...) en `pg` previene inyecciones a través de las variables del pase.
3. **Datos Sensibles:** El campo `variables_resueltas` se guarda como JSONB. Esto permite consultas futuras (ej: buscar todos los pases impresos con el apellido "Perez") sin necesidad de hacer joins complejos, manteniendo el snapshot histórico.