import type { VariableDef } from './vars';

export const VARIABLE_CATALOG: ReadonlyArray<VariableDef> = [
  { key: 'nro_interno',       label: 'Nº interno',           source: 'pat' },
  { key: 'zona',              label: 'Zona',                 source: 'pat' },
  { key: 'acceso',            label: 'Acceso',               source: 'pat' },
  { key: 'apellido_nombre',   label: 'Apellido y Nombre',    source: 'registro', format: 'title' },
  { key: 'tipo_documento',    label: 'Tipo de documento',    source: 'registro', format: 'upper' },
  { key: 'nro_documento',     label: 'Nº documento',         source: 'registro' },
  { key: 'fecha_vencimiento', label: 'Fecha vencimiento',    source: 'pat',      format: 'dd/mm/yyyy' },
  { key: 'motivo',            label: 'Motivo',               source: 'pat' },
  { key: 'codigo_seguridad',  label: 'Código de seguridad',  source: 'pat' }, // o 'sistema' si lo generás en otro flujo
] as const;
