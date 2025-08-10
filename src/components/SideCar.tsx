// src/components/SideCar.tsx
import React from 'react';
import { Rnd } from 'react-rnd';
import './SideCar.css';

interface SideCarProps {
  title: string;
  url: string;
  onClose: () => void;
  width: number;
  height: number;
  onResize: (width: number, height: number) => void;
}

const SideCar: React.FC<SideCarProps> = ({ title, url, onClose, width, height, onResize }) => {
  return (
    <Rnd
      size={{ width, height }}
      onResizeStop={(_e, _dir, ref) => {
        onResize(ref.offsetWidth, ref.offsetHeight);
      }}
      default={{
        x: window.innerWidth - width - 20,
        y: 80,
        width: width,
        height: height,
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      className="sidecar-container"
      dragHandleClassName="sidecar-header"
    >
      <div className="sidecar-header">
        <span className="sidecar-title">{title}</span>
        <button onClick={onClose} className="sidecar-close-button">&times;</button>
      </div>
      <div className="sidecar-content">
        <iframe
          src={url}
          title={title}
          frameBorder="0"
          className="sidecar-iframe"
        />
      </div>
    </Rnd>
  );
};

export default SideCar;