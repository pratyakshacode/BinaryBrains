import {
    Tooltip as ShadcnTooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    delay?: number;
}

export default function Tooltip({
    content,
    children,
    side = 'top',
    align = 'center',
    delay = 200,
}: TooltipProps) {
    if (!content) {
        return <>{children}</>;
    }

    return (
        <TooltipProvider delayDuration={delay}>
            <ShadcnTooltip>
                {/* IMPORTANT: wrap children */}
                <TooltipTrigger asChild>{children}</TooltipTrigger>

                <TooltipContent side={side} align={align}>
                    {content}
                </TooltipContent>
            </ShadcnTooltip>
        </TooltipProvider>
    );
}
