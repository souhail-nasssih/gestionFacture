import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeToggle({ className = '' }) {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Vérifie le thème au montage
        const isDark = localStorage.theme === 'dark' ||
                      (!('theme' in localStorage) &&
                       window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDarkMode(isDark);
        updateTheme(isDark);
    }, []);

    const updateTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    };

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        updateTheme(newMode);
    };

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
        </button>
    );
}
