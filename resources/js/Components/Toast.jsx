import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Toast context/state management
let toastListeners = [];
let toastState = [];

export const showToast = (message, type = 'error') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    
    toastState = [...toastState, newToast];
    toastListeners.forEach(listener => listener(toastState));
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeToast(id);
    }, 5000);
    
    return id;
};

export const removeToast = (id) => {
    toastState = toastState.filter(toast => toast.id !== id);
    toastListeners.forEach(listener => listener(toastState));
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const listener = (newToasts) => {
            setToasts(newToasts);
        };
        
        toastListeners.push(listener);
        setToasts(toastState);
        
        return () => {
            toastListeners = toastListeners.filter(l => l !== listener);
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}

function ToastItem({ toast }) {
    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-200';
            case 'info':
                return 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200';
            default: // error
                return 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-200';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="h-5 w-5" />;
            case 'info':
                return <Info className="h-5 w-5" />;
            default:
                return <AlertCircle className="h-5 w-5" />;
        }
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-md ${getStyles()}`}>
            {getIcon()}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-70 hover:opacity-100 transition-opacity"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

