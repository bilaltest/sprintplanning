export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: 'danger' | 'primary' | 'warning';
}

export interface ConfirmationResult {
  confirmed: boolean;
}
