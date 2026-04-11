type ConfirmVariant = 'default' | 'destructive';

export interface ConfirmModalOptions {
    title: string;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmVariant;
    icon?: React.ReactNode;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
}

type Listener = (options: ConfirmModalOptions) => void;

let listener: Listener | null = null;

export function onConfirmModal(options: ConfirmModalOptions) {
    if (!listener) {
        console.warn('ConfirmModal is not mounted');
        return;
    }
    listener(options);
}

export function registerConfirmListener(fn: Listener) {
    listener = fn;
}
