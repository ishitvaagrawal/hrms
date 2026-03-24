import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  footer?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

const Card: React.FC<CardProps> = ({ children, title, className = '', footer, onClick }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
