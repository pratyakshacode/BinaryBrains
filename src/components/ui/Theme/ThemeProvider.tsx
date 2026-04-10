import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
};

type ThemeProviderState = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
    undefined
);

export function ThemeProvider({
    children,
    defaultTheme = 'dark', // You can default to dark or light
    ...props
}: ThemeProviderProps) {
    // Initialize state from localStorage, or fallback to defaultTheme
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('vite-ui-theme') as Theme;
        if (storedTheme) return storedTheme;

        // Optional: Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches)
            return 'dark';
        return defaultTheme;
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old classes and add the current theme
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Save to localStorage so it persists on reload
        localStorage.setItem('vite-ui-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeProviderContext.Provider
            {...props}
            value={{ theme, toggleTheme }}
        >
            {children}
        </ThemeProviderContext.Provider>
    );
}

// Custom hook to easily use the theme in any component
export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
