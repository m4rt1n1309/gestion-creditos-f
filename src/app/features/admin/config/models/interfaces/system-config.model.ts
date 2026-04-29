export interface SystemConfigParam {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface SystemConfigUpdatePayload {
  value: string;
}

export type ConfigTab =
  | 'empresa'
  | 'tasas'
  | 'tasas-producto'
  | 'parametros'
  | 'usuarios'
  | 'notificaciones'
  | 'categorias-producto'
  | 'marcas';

export interface TabItem {
  id: ConfigTab;
  label: string;
  icon: string;
}

export interface SystemConfigParamRaw {
  key: string;
  value: string;
  description: string;
  updated_at: string;
  updated_by: string | null;
}

export interface ParamMeta {
  label: string;
  range: string;
  hint: string;
  min: number;
  max: number;
}
