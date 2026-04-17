interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'neutral' | 'primary';
  children: React.ReactNode;
  className?: string;
}

const variantStyle: Record<NonNullable<BadgeProps['variant']>, React.CSSProperties> = {
  success: { backgroundColor: 'rgb(16 185 129 / 0.15)', color: '#34D399' },
  error:   { backgroundColor: 'rgb(239 68 68 / 0.15)',  color: '#F87171' },
  warning: { backgroundColor: 'rgb(245 158 11 / 0.15)', color: '#FBBF24' },
  neutral: { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' },
  primary: { backgroundColor: 'rgb(245 166 35 / 0.15)', color: 'var(--color-primary)' },
};

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 ${className}`}
      style={variantStyle[variant]}
    >
      {children}
    </span>
  );
}
