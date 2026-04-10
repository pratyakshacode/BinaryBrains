import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, leftSection, rightSection, ...props }, ref) => {
        return (
            <div className="relative flex w-full items-center">
                {/* Left Section */}
                {leftSection && (
                    <div className="absolute left-3 flex items-center justify-center text-muted-foreground">
                        {leftSection}
                    </div>
                )}

                <input
                    type={type}
                    className={cn(
                        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors',
                        // Dynamically add padding if a section is present so text doesn't overlap
                        leftSection && 'pl-10',
                        rightSection && 'pr-10',
                        className
                    )}
                    ref={ref}
                    {...props}
                />

                {/* Right Section */}
                {rightSection && (
                    <div className="absolute right-3 flex items-center justify-center text-muted-foreground">
                        {rightSection}
                    </div>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
