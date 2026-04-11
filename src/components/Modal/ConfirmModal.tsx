import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
    registerConfirmListener,
    type ConfirmModalOptions,
} from './onConfirmModal';

export default function ConfirmModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<ConfirmModalOptions | null>(null);

    useEffect(() => {
        registerConfirmListener(opts => {
            setOptions(opts);
            setOpen(true);
        });
    }, []);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await options?.onConfirm?.();
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    const handleCancel = () => {
        options?.onCancel?.();
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                        {options?.title}
                    </AlertDialogTitle>

                    {options?.description && (
                        <AlertDialogDescription>
                            {options.description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        onClick={handleCancel}
                        className="text-foreground hover:bg-transparent hover:text-gray-400"
                    >
                        {options?.cancelText ?? 'Cancel'}
                    </AlertDialogCancel>

                    <Button
                        variant={
                            options?.variant === 'destructive'
                                ? 'destructive'
                                : 'default'
                        }
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading
                            ? 'Please wait...'
                            : options?.confirmText ?? 'Confirm'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
