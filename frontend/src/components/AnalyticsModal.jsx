import React, { useEffect, useRef } from 'react';

const AnalyticsModal = ({ isOpen, onClose, title, children }) => {
  const overlayRef = useRef();

  // Close on Esc key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on clicking overlay
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleOverlayClick}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative flex flex-col"
           style={{ maxHeight: '90vh' }}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 flex items-center gap-1 text-gray-700 hover:text-red-600 text-2xl font-bold px-2 py-1 bg-white rounded shadow-sm border border-gray-200"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
          <span className="text-base font-semibold">Close</span>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
        <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
          {children}
        </div>
        <div className="pt-4 text-center text-xs text-gray-400">
          Click outside, press <kbd>Esc</kbd>, or use the Close button to exit.
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
