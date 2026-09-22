import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = true,
  size = 'md',
  color = 'indigo',
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colors = {
    indigo: 'bg-brand-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
          <span>Progress</span>
          <span className="text-slate-900 font-bold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${heights[size] || heights.md}`}>
        <div
          className={`${colors[color] || colors.indigo} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
