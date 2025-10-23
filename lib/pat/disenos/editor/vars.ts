// lib/pat/disenos/editor/vars.ts

export type RegistroVars = {
  nombre?: string;
  apellido?: string;
  tipo_documento?: 'DNI' | 'PAS';
  documento?: string;
};

export type PatVars = {
  nro_interno?: string;
  tipo_zona?: string;               // Ej: "ZR"
  acceso_pat?: string;              // Ej: "Puerta 3"
  causa_motivo_pat?: string;        // Motivo
  fecha_vencimiento?: string;       // ISO o "YYYY-MM-DD"
  codigo_de_seguridad?: string;     // Generado por backend
};

export type Vars = {
  registro?: RegistroVars;
  pat?: PatVars;
};

export type VariableKey =
  | 'nro_interno'
  | 'zona'
  | 'acceso'
  | 'apellido_nombre'
  | 'tipo_documento'
  | 'nro_documento'
  | 'fecha_vencimiento'
  | 'motivo'
  | 'codigo_seguridad';

export type VariableSource = 'registro' | 'pat' | 'sistema';

export type VariableDef = {
  key: VariableKey;
  label: string;
  source: VariableSource;
  format?: 'upper' | 'title' | 'dd/mm/yyyy';
};

