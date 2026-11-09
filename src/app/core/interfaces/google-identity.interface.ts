/**
 * Tipos mínimos de Google Identity Services (`https://accounts.google.com/gsi/client`).
 * Solo lo que usa la app: el botón y la respuesta con el `credential`.
 */
export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

export interface GoogleIdConfiguration {
  client_id: string;
  callback: (respuesta: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  ux_mode?: 'popup' | 'redirect';
  itp_support?: boolean;
  use_fedcm_for_button?: boolean;
}

export type GoogleButtonText = 'signin_with' | 'signup_with' | 'continue_with' | 'signin';

export interface GoogleButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: GoogleButtonText;
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

export interface GoogleAccountsId {
  initialize(config: GoogleIdConfiguration): void;
  renderButton(elemento: HTMLElement, opciones: GoogleButtonOptions): void;
  disableAutoSelect(): void;
  cancel(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}
