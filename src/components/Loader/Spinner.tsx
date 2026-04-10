import { Loader2 } from 'lucide-react';

interface LoaderProps {
    /** * If true, takes up the full screen height (100vh).
     * If false, takes up 100% of its parent container.
     */
    fullScreen?: boolean;
    /** * Optional text to display below the spinner.
     */
    text?: string;
}

const Loader = ({ fullScreen = true, text = 'Loading...' }: LoaderProps) => {
    return (
        <div
            className={`flex flex-col items-center justify-center bg-background transition-colors ${
                fullScreen
                    ? 'h-screen w-full fixed inset-0 z-50'
                    : 'h-full w-full py-12'
            }`}
        >
            {/* The spinner uses your brand's primary teal color */}
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />

            {/* Subtle pulsing text below the spinner */}
            {text && (
                <p className="text-muted-foreground text-sm font-medium animate-pulse tracking-wide">
                    {text}
                </p>
            )}
        </div>
    );
};

export default Loader;
