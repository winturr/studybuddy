"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-3 sm:p-5"
      onClick={handleBackdropClick}
      style={{ isolation: "isolate" }}
    >
      {/* Modal content */}
      <div className="relative bg-neutral-900 border-2 border-green-600 shadow-lg shadow-green-900/30 max-w-xl w-full h-auto max-h-[95dvh] sm:max-h-[90dvh]">
        <button
          className="absolute cursor-pointer aspect-square p-1.5 sm:p-2 bg-neutral-900 top-2 right-2 text-green-500 hover:bg-green-800 hover:text-green-300 transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        {/** Title */}
        {title && (
          <div className="font-bold text-green-500 text-sm sm:text-base p-3 sm:p-5 pr-10 sm:pr-12 border-b-2 border-green-600">
            {title}
          </div>
        )}
        <div className="p-3 sm:p-5 max-h-[85dvh] sm:max-h-[83dvh] overflow-y-auto text-green-500 text-sm sm:text-base">
          {children}
        </div>
      </div>
    </div>
  );

  // Render the modal at the document body level
  return createPortal(modalContent, document.body);
};

export default Modal;
