/** Error de login o registro con el mensaje listo para mostrar y el estado HTTP que lo causó. */
export class ErrorAutenticacion extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ErrorAutenticacion';
  }
}
