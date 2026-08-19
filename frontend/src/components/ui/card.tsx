import { CSSProperties } from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow border ${className}`}>
      {children}
    </div>
  );
};

type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 border-b ${className}`}>
      {children}
    </div>
  );
};

type CardTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardTitle = ({ children, className = '' }: CardTitleProps) => {
  return (
    <h3 className={`text-lg font-semibold leading-none text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardContent = ({ children, className = '' }: CardContentProps) => {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
};