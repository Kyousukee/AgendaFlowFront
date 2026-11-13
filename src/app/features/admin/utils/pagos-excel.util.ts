import type { Cell, SheetData } from 'write-excel-file/browser';
import { Pago } from '../../../core/interfaces/pago.interface';

const FORMATO_PESOS = '"$"#,##0';
const FORMATO_FECHA = 'dd/mm/yyyy';

/** Textos de cada fila, los mismos que muestra la tabla de Pagos. */
export interface TextosPago {
  cliente: string;
  servicio: string;
  empleado: string;
  sucursal: string;
}

const COLUMNAS: { titulo: string; ancho: number }[] = [
  { titulo: '#', ancho: 8 },
  { titulo: 'Fecha', ancho: 12 },
  { titulo: 'Hora', ancho: 8 },
  { titulo: 'Cliente', ancho: 28 },
  { titulo: 'Servicio', ancho: 24 },
  { titulo: 'Empleado', ancho: 24 },
  { titulo: 'Sucursal', ancho: 20 },
  { titulo: 'Monto', ancho: 12 },
  { titulo: 'Reembolsado', ancho: 13 },
  { titulo: 'Método', ancho: 14 },
  { titulo: 'Estado', ancho: 14 },
];

/** "HH:mm" en la hora local, como en la tabla. */
function hora(fecha: Date): string {
  return fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Descarga como .xlsx los pagos que se ven en pantalla (ya filtrados). La librería se carga
 * recién al hacer clic, para no sumar peso a la página.
 */
export async function descargarPagosExcel(
  pagos: Pago[],
  textos: (pago: Pago) => TextosPago,
  nombreArchivo: string,
): Promise<void> {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');

  const encabezado: Cell[] = COLUMNAS.map((c) => ({
    value: c.titulo,
    fontWeight: 'bold',
    backgroundColor: '#EEEEEE',
  }));

  const filas: Cell[][] = pagos.map((pago) => {
    const t = textos(pago);
    const fecha = new Date(pago.fechaPago);
    return [
      { value: pago.id, type: Number },
      { value: fecha, type: Date, format: FORMATO_FECHA },
      { value: hora(fecha) },
      { value: t.cliente },
      { value: t.servicio },
      { value: t.empleado },
      { value: t.sucursal },
      { value: Number(pago.monto), type: Number, format: FORMATO_PESOS },
      pago.montoReembolsado
        ? { value: Number(pago.montoReembolsado), type: Number, format: FORMATO_PESOS }
        : null,
      { value: pago.metodoPago || '' },
      { value: pago.estado?.nombre ?? '' },
    ];
  });

  const datos: SheetData = [encabezado, ...filas];
  await writeXlsxFile(datos, {
    sheet: 'Pagos',
    columns: COLUMNAS.map((c) => ({ width: c.ancho })),
    stickyRowsCount: 1,
  }).toFile(nombreArchivo);
}
