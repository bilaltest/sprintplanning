export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
  createdAt: number;
}

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
}
