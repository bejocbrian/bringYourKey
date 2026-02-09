import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import type { HTMLAttributes } from 'react';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-purple-500/20 text-purple-300 border-purple-500/30',
                secondary: 'border-transparent bg-white/10 text-white/80 border-white/20',
                destructive: 'border-transparent bg-red-500/20 text-red-300 border-red-500/30',
                outline: 'text-white/60 border-white/20',
                success: 'border-transparent bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                warning: 'border-transparent bg-amber-500/20 text-amber-300 border-amber-500/30',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
