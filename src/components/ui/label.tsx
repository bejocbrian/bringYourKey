import type { LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    className?: string;
}

export function Label({ className, ...props }: LabelProps) {
    return (
        <label
            className={cn('text-sm font-medium text-white', className)}
            {...props}
        />
    );
}
