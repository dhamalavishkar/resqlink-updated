type BadgeProps = {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'success';
  className?: string;
  children: React.ReactNode;
};

export const Badge = ({
  variant = 'default',
  className = '',
  children
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)/30%] focus:ring-offset-[var(--color-background)]';

  const variantClasses = {
    default: `bg-[var(--color-primary)] text-[var(--color-background)]`,
    destructive: `bg-[var(--color-accent-red)] text-[var(--color-background)]`,
    outline: `border border-[var(--color-border)/50%] bg-[var(--color-background)/50%] text-[var(--color-text)]`,
    secondary: `bg-[var(--color-secondary)] text-[var(--color-background)]`,
    success: `bg-[var(--color-accent-green)] text-[var(--color-background)]`
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};