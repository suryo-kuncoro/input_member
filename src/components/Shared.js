import React from 'react';
import { X, Check, AlertCircle, Info, Loader } from 'lucide-react';

// ===== BUTTON COMPONENTS =====

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  icon = null,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-sm hover:shadow-md',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm hover:shadow-md',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    link: 'text-indigo-600 hover:text-indigo-700 hover:underline'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};

export const IconButton = ({ 
  icon, 
  onClick, 
  variant = 'ghost', 
  size = 'md',
  title = '',
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    danger: 'text-red-600 hover:bg-red-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    success: 'text-green-600 hover:bg-green-50'
  };
  
  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};

// ===== MODAL COMPONENT =====

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer = null,
  size = 'md',
  closeOnOverlay = true 
}) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div 
        className="absolute inset-0" 
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div className={`relative bg-white rounded-lg shadow-2xl w-full ${sizes[size]} animate-slideUp`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <IconButton
            icon={<X className="w-5 h-5" />}
            onClick={onClose}
            variant="ghost"
          />
        </div>
        
        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== CONFIRM MODAL =====

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Konfirmasi',
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
};

// ===== ALERT COMPONENT =====

export const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose = null,
  className = '' 
}) => {
  const types = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5" />
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <Check className="w-5 h-5" />
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertCircle className="w-5 h-5" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5" />
    }
  };
  
  const config = types[type];
  
  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={config.text}>{config.icon}</div>
        <div className="flex-1">
          {title && <h4 className={`font-semibold ${config.text} mb-1`}>{title}</h4>}
          <p className={`text-sm ${config.text}`}>{message}</p>
        </div>
        {onClose && (
          <IconButton
            icon={<X className="w-4 h-4" />}
            onClick={onClose}
            variant="ghost"
            size="sm"
          />
        )}
      </div>
    </div>
  );
};

// ===== CARD COMPONENT =====

export const Card = ({ 
  title, 
  children, 
  footer = null,
  className = '',
  headerAction = null 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {title && (
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          {headerAction}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="p-6 border-t bg-gray-50">{footer}</div>
      )}
    </div>
  );
};

// ===== TABLE COMPONENT =====

export const Table = ({ 
  columns, 
  data, 
  onRowClick = null,
  emptyMessage = 'Tidak ada data',
  className = '' 
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx}
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr 
                key={rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b hover:bg-gray-50 transition ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIdx) => (
                  <td 
                    key={colIdx}
                    className={`px-4 py-3 text-sm text-gray-700 ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ===== INPUT COMPONENTS =====

export const Input = ({ 
  label, 
  error, 
  helper,
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition ${
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-indigo-500'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helper && !error && <p className="text-sm text-gray-500 mt-1">{helper}</p>}
    </div>
  );
};

export const TextArea = ({ 
  label, 
  error, 
  helper,
  required = false,
  className = '',
  rows = 3,
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition resize-none ${
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-indigo-500'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helper && !error && <p className="text-sm text-gray-500 mt-1">{helper}</p>}
    </div>
  );
};

export const Select = ({ 
  label, 
  error, 
  options = [],
  placeholder = 'Pilih...',
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition ${
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-indigo-500'
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

// ===== BADGE COMPONENT =====

export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-indigo-100 text-indigo-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

// ===== LOADING SPINNER =====

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  return (
    <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizes[size]} ${className}`} />
  );
};

export const LoadingOverlay = ({ message = 'Memuat...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
      <LoadingSpinner size="lg" className="border-white" />
      <p className="mt-4 text-white font-medium">{message}</p>
    </div>
  );
};

// ===== EMPTY STATE =====

export const EmptyState = ({ 
  icon = null,
  title = 'Tidak ada data',
  message = '',
  action = null,
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mx-auto w-16 h-16 text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {message && <p className="text-gray-500 mb-4">{message}</p>}
      {action}
    </div>
  );
};

// ===== NOTIFICATION TOAST =====

export const Toast = ({ 
  message, 
  type = 'info',
  onClose,
  duration = 3000 
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const types = {
    info: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };
  
  return (
    <div className={`fixed bottom-4 right-4 ${types[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideUp z-50`}>
      <span>{message}</span>
      <IconButton
        icon={<X className="w-4 h-4" />}
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white hover:bg-opacity-20"
      />
    </div>
  );
};

// ===== PAGINATION =====

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Sebelumnya
      </Button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            page === currentPage
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Selanjutnya
      </Button>
    </div>
  );
};

// ===== TABS =====

export const Tabs = ({ 
  tabs, 
  activeTab, 
  onChange,
  className = '' 
}) => {
  return (
    <div className={`border-b ${className}`}>
      <div className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-4 py-2 font-medium transition border-b-2 ${
              activeTab === tab.value
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;
document.head.appendChild(style);
