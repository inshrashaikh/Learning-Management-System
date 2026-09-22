import React from 'react';

const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden ${
        hover ? 'transition-all duration-200 hover:shadow-elevated hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer' : 'transition-shadow duration-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-5 sm:p-6 border-b border-slate-100 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-5 sm:p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-5 sm:p-6 bg-slate-50/60 border-t border-slate-100 ${className}`}>{children}</div>
);

export default Card;
