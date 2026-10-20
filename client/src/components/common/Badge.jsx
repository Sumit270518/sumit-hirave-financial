import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm' }) => {
  const variantClasses = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    negative: 'bg-rose-50 text-rose-700 border-rose-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    info: 'bg-sky-50 text-sky-700 border-sky-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant] || variantClasses.neutral} ${sizeClasses[size] || sizeClasses.sm}`}
    >
      {children}
    </span>
  );
};

export default Badge;
