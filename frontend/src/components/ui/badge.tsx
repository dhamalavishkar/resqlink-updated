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
  const baseClasses = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-background text-muted-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-success text-success-foreground'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};