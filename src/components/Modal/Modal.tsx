// src/components/ui/Modal.tsx
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-2xl',
}: ModalProps) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full ${maxWidth} bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};
