# Documentación Técnica de Base de Datos: Sistema de Control de Accesos e Identificación

**Fecha de última actualización:** 28/11/2025
**Motor de Base de Datos:** PostgreSQL
**Responsable:** [Tu Nombre]

---

## 1. Introducción y Contexto del Proyecto
Este documento describe el esquema de base de datos para el subsistema de **Negocio** de la aplicación. El sistema tiene como objetivo gestionar el ciclo de vida de los accesos físicos a las instalaciones, desde la solicitud de autorización hasta el registro efectivo del ingreso/egreso, así como la gestión y diseño de las credenciales físicas (Pases de Acceso Transitorio - PAT).

**Alcance:**
* Registro de personas y antecedentes.
* Gestión de autorizaciones (Pases).
* Bitácora de ingresos y egresos diarios.
* Editor y renderizado de credenciales (Diseños y Recursos).

---

## 2. Convenciones y Niveles de Documentación
La estructura se define en tres niveles:
1.  **Nivel Esquema:** Separación lógica entre tablas de negocio y tablas de sistema (Auth).
2.  **Nivel Tabla:** Definición de la entidad y su representación en el mundo real.
3.  **Nivel Columna:** Tipos de datos, restricciones (Null/Not Null) y reglas de negocio específicas.

**Nota sobre Nulabilidad:**
* **Requerido (Sí):** El campo NO acepta valores nulos (`NOT NULL`).
* **Requerido (No):** El campo es opcional (`NULL`).

---

## 3. Módulo A: Gestión de Accesos y Personas
Este módulo centraliza la información de los individuos externos e internos y sus movimientos físicos dentro del perímetro.

### 3.1 Tabla: `registro`
**Descripción:** Maestro de personas. Almacena los datos filiatorios de cualquier individuo que interactúa con el sistema (visitas, personal, contratistas). Utiliza el número de documento como clave natural.

| Columna | Tipo de Dato | Requerido | Descripción / Reglas de Negocio |
| :--- | :--- | :---: | :--- |
| `documento` | VARCHAR | **Sí (PK)** | Clave Primaria. Número de DNI/Pasaporte. |
| `tipo_documento` | VARCHAR | Sí | Ej: 'DNI', 'PASAPORTE', 'LC'. |
| `nombre` | VARCHAR | Sí | Nombres completos. |
| `apellido` | VARCHAR | Sí | Apellidos completos. |
| `fecha_nacimiento` | DATE | No | Fecha de nacimiento para cálculo de edad. |
| `nacionalidad` | VARCHAR | No | País de origen. |
| `domicilio_real` | VARCHAR | No | Domicilio legal/actual de la persona. |
| `domicilio_eventual`| VARCHAR | No | Domicilio donde se aloja (si es extranjero o temporal). |
| `observacion_cc` | BOOLEAN | No | **Flag Crítico.** Indica si posee observaciones en Control de Causa/Antecedentes. `True` requiere revisión. |
| `observacion` | TEXT | No | Detalles adicionales sobre la persona. |
| `creado_por` | VARCHAR | Sí | Usuario que dio de alta el registro. |
| `actualizado_por` | VARCHAR | Sí | Último usuario que modificó el registro. |

### 3.2 Tabla: `solicitante`
**Descripción:** Catálogo de autoridades o personal interno habilitado para solicitar o autorizar el ingreso de terceros.

| Columna | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `identificador` | VARCHAR | **Sí (PK)** | ID único del solicitante (Legajo, DNI interno, etc). |
| `tipo_identificador`| VARCHAR | Sí | Tipo de ID provisto. |
| `jerarquia` | VARCHAR | Sí | Rango o cargo del solicitante. |
| `destino` | VARCHAR | Sí | Unidad, Oficina o Departamento al que pertenece. |
| `telefono` | VARCHAR | Sí | Contacto directo para validaciones de seguridad. |
| `nombre` | VARCHAR | Sí | Nombre completo del solicitante. |

### 3.3 Tabla: `pases_acceso_transitorio`
**Descripción:** Representa la **autorización** vigente. Vincula a una persona (`registro`) con un autorizante (`solicitante`) por un periodo de tiempo determinado.

| Columna | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | INT | **Sí (PK)** | Identificador autoincremental del pase. |
| `documento_registro`| VARCHAR | Sí (FK) | Vincula con `registro.documento`. Quién recibe el pase. |
| `identificador_solicitante` | VARCHAR | Sí (FK) | Vincula con `solicitante.identificador`. Quién autoriza. |
| `nro_interno` | VARCHAR | Sí | Número de control interno / expediente físico. |
| `fecha_extension` | DATE | Sí | Fecha en la que se emitió/extendió la autorización. |
| `fecha_vencimiento` | DATE | Sí | Fecha límite de validez del pase. |
| `tipo_zona` | VARCHAR | Sí | Zona permitida (Ej: 'Planta Baja', 'Área Restringida'). |
| `acceso_pat` | VARCHAR | Sí | [TODO: Definir qué diferencia hay con tipo_zona]. |
| `causa_motivo_pat` | TEXT | Sí | Justificación de la solicitud. |
| `codigo_de_seguridad`| VARCHAR | Sí | Hash o código para validación rápida (QR). |

### 3.4 Tabla: `ingreso_por_dia`
**Descripción:** Bitácora transaccional (Log). Registra cada evento físico de entrada y salida.

| Columna | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id_ingreso` | INT | **Sí (PK)** | Identificador único del evento. |
| `documento` | VARCHAR | Sí (FK) | Vincula con la persona que ingresa. |
| `nro_tarjeta` | VARCHAR | Sí | Número de la tarjeta RFID/Magnética entregada temporalmente. |
| `fecha_ingreso` | TIMESTAMP | Sí | Fecha y hora exacta de entrada. |
| `fecha_egreso` | TIMESTAMP | No | Fecha y hora exacta de salida. `NULL` si aún está dentro. |
| `lugar_visita` | VARCHAR | Sí | Oficina específica a la que se dirige hoy. |
| `motivo` | TEXT | Sí | Motivo puntual del día (ej: "Reunión", "Mantenimiento"). |
| `observacion` | TEXT | No | Notas del guardia de turno. |
| `identificador_solicitante` | VARCHAR | Sí | Referencia al solicitante de este ingreso específico. |
| `abierto_por` | TEXT | No | Usuario (Guardia) que registró la entrada. |
| `cerrado_por` | TEXT | No | Usuario (Guardia) que registró la salida. |
| `cierre_fuera_de_tiempo` | BOOLEAN | No | Flag. `True` si el sistema cerró el ingreso automáticamente por fin de jornada. |
| `motivo_cierre_...` | TEXT | No | Justificación del cierre forzoso o manual posterior. |

---

## 4. Módulo B: Diseño e Impresión (PAT)
Este módulo gestiona la composición visual de las credenciales, permitiendo diseños dinámicos y auditoría de impresiones.

### 4.1 Tabla: `diseno_pat`
**Descripción:** Define las plantillas (templates) de las credenciales. Guarda la configuración del lienzo.

| Columna | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | BIGINT | **Sí (PK)** | Identificador del diseño. |
| `nombre` | TEXT | Sí | Nombre descriptivo (ej: "Pase Visita Técnica 2025"). |
| `ancho_mm` | NUMERIC | Sí | Ancho físico de la tarjeta en milímetros. |
| `alto_mm` | NUMERIC | Sí | Alto físico de la tarjeta en milímetros. |
| `dpi_previsualizacion`| INT | Sí | Resolución para renderizado en pantalla. |
| `lienzo_json` | JSONB | Sí | **Core.** Estructura JSON con coordenadas, textos estáticos y configuración visual. |
| `estado` | TEXT | Sí | Ej: 'Borrador', 'Publicado', 'Archivado'. |

### 4.2 Tabla: `recurso`
**Descripción:** Banco de imágenes y assets (Logos, firmas, fondos) para usar en los diseños.
*Nota Técnica:* Los archivos se almacenan como binarios (`bytea`) directamente en la DB.

| Columna | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | BIGINT | **Sí (PK)** | Identificador del recurso. |
| `nombre` | TEXT | Sí | Nombre del archivo original. |
| `mime_type` | TEXT | Sí | Tipo MIME (ej: `image/png`, `image/jpeg`). |
| `sha256` | CHAR | Sí | Hash para validar integridad y evitar duplicados. |
| `bytes_size` | INT | Sí | Peso del archivo en bytes. |
| `ancho_px` / `alto_px`| INT | Sí | Dimensiones en píxeles. |
| `datos` | BYTEA | Sí | El archivo binario en sí. |
| `thumb_datos` | BYTEA | No | Miniatura generada para previsualización rápida. |

### 4.3 Tabla: `recurso_en_diseno`
**Descripción:** Tabla pivote (N:M). Asocia qué recursos se utilizan en qué diseño.

| Columna | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `diseno_id` | BIGINT | **Sí (FK)** | Referencia a `diseno_pat`. |
| `recurso_id` | BIGINT | **Sí (FK)** | Referencia a `recurso`. |

### 4.4 Tabla: `log_impresion_pat`
**Descripción:** Auditoría de seguridad. Registra cada vez que se imprime una credencial física.

| Columna | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | BIGINT | **Sí (PK)** | ID del evento de impresión. |
| `pat_id` | BIGINT | **Sí** | Referencia lógica al pase impreso (puede referir a `pases_acceso_transitorio`). |
| `diseno_id` | BIGINT | **Sí (FK)** | Qué plantilla visual se utilizó. |
| `impreso_por` | TEXT | Sí | Usuario que ejecutó la impresión. |
| `impreso_en` | TIMESTAMP | Sí | Momento exacto de la impresión. |
| `copias` | INT | Sí | Cantidad de copias físicas emitidas. |
| `variables_resueltas`| JSONB | Sí | Snapshot de los datos que se inyectaron en el diseño al momento de imprimir (para reconstrucción forense). |

---