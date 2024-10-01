// components/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ">
      <div className="bg-white p-2 pt-10 rounded-lg shadow-lg max-w-xl w-full relative border-none">
        {children}
      </div>
    </div>
  );
};

export default Modal;
