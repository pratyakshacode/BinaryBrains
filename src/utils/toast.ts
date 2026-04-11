import { toast } from '@/hooks/use-toast';

type ToastVariant = 'default' | 'destructive';

interface ShowToastProps {
    title?: string;
    description: string;
    variant?: ToastVariant;
    duration?: number;
    color?: string; // Tailwind class for background or text
}

const colorClassMap: Record<string, string> = {
    black: 'border-black-500 bg-black-100 text-white-900',
    green: 'border-green-500 bg-green-100 text-green-900',
    red: 'border-red-500 bg-red-100 text-red-900',
    blue: 'border-blue-500 bg-blue-100 text-blue-900',
    yellow: 'border-yellow-500 bg-yellow-100 text-yellow-900',
    lime: 'border-lime-500 bg-lime-100 text-lime-900',
    transparent: 'border bg-card text-foreground',
    // add more as needed
};

export function showToast({
    title = 'Notification',
    description,
    variant = 'default',
    duration = 4000,
    color = 'transparent',
}: ShowToastProps) {
    toast({
        title,
        description,
        variant,
        duration,
        className: colorClassMap[color] || '',
    });
}
