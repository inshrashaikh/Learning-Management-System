import React from 'react';

const Badge = ({ children, variant = 'indigo', size = 'sm', className = '' }) => {
  const variants = {
    indigo: 'bg-brand-50 text-brand-700 border-brand-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-sm px-3 py-1 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variants[variant] || variants.slate} ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
