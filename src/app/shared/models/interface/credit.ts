// TODO: reemplazar por variables en ingles, solo es provisorio para las pruebas del frontend

export interface Credit {
  id: string;
  tipo: string;
  producto: string;
  montoOriginal: number;
  saldoPendiente: number;
  cuotaActual: number;
  totalCuotas: number;
  cuotaMensual: number;
  proximoVencimiento: string;
  tasa: string;
  estado: 'ACTIVO' | 'EN MORA' | 'PAGADO';
  progreso: number;
  diasMora?: number;
  moraAcumulada?: number;
  vencimientoMora?: string;
}
