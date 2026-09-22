import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-glow focus-visible:ring-brand-500 border border-transparent',
    secondary:
      'bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200 focus-visible:ring-slate-400 shadow-xs',
    outline:
      'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 focus-visible:ring-brand-500 shadow-subtle',
    'outline-white':
      'bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm focus-visible:ring-white/50',
    'outline-light':
      'bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm focus-visible:ring-white/50',
    white:
      'bg-white hover:bg-slate-50 text-brand-700 hover:text-brand-800 shadow-sm border border-transparent focus-visible:ring-brand-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus-visible:ring-rose-500 border border-transparent',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-950 focus-visible:ring-slate-300',
    dark:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus-visible:ring-slate-700 border border-slate-800',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus-visible:ring-emerald-500 border border-transparent'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5'
  };

  // Smart fallback: if outline is requested with white text or transparent/glass background, use outline-white
  let effectiveVariant = variant;
  if (
    variant === 'outline' &&
    (className.includes('text-white') || className.includes('bg-transparent') || className.includes('bg-white/'))
  ) {
    effectiveVariant = 'outline-white';
  }

  const variantClass = variants[effectiveVariant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variantClass} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
