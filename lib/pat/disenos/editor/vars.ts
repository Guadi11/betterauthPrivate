// lib/pat/disenos/editor/vars.ts

export interface RegistroVars {
  nombre?: string;
  apellido?: string;
  documento?: string;
}

export interface SolicitanteVars {
  nombre?: string;
}

export interface Vars {
  registro?: RegistroVars;
  solicitante?: SolicitanteVars;
  // extendible…
}
