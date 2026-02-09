import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            className={cn(
                'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                'placeholder:text-white/40',
                className
            )}
            {...props}
        />
    );
}
