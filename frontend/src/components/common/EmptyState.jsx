import React from 'react';
import { BookOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
