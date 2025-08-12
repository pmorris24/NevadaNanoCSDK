import React, { ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'default' | 'wide'; // Add new size prop
}

const Modal: React.FC<ModalProps> = ({ onClose, title, children, size = 'default' }) => {
  // Conditionally apply a size class to the modal content
  const modalContentClass = `modal-content modal-content-${size}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;