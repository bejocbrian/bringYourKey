import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'default' | 'outline' | 'ghost';
    className?: string;
}

export function Button({ children, variant = 'default', className, ...props }: ButtonProps) {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        default: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-glow',
        outline: 'glass-panel border border-white/20 hover:bg-white/10',
        ghost: 'hover:bg-white/10',
    };

    return (
        <button
            className={cn(baseStyles, variantStyles[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
}
