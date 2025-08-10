import React, { useEffect, useRef, RefObject } from "react";

interface CrosshairProps {
  color?: string;
  containerRef?: RefObject<HTMLElement | null>;
  mousePosition: { x: number; y: number };
  isVisible: boolean;
}

const Crosshair: React.FC<CrosshairProps> = ({
  color = "white",
  containerRef = null,
  mousePosition,
  isVisible,
}) => {
  const lineHorizontalRef = useRef<HTMLDivElement>(null);
  const lineVerticalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef?.current;
    const hLine = lineHorizontalRef.current;
    const vLine = lineVerticalRef.current;

    if (!container || !hLine || !vLine) return;
    
    const bounds = container.getBoundingClientRect();
    const x = mousePosition.x - bounds.left + container.scrollLeft;
    const y = mousePosition.y - bounds.top + container.scrollTop;

    vLine.style.transform = `translateX(${x}px)`;
    hLine.style.transform = `translateY(${y}px)`;

  }, [containerRef, mousePosition]);

  return (
    <div
      className="cursor"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10000,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      <div
        ref={lineHorizontalRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          background: color,
        }}
      />
      <div
        ref={lineVerticalRef}
        style={{
          position: "absolute",
          height: "100%",
          width: "1px",
          background: color,
        }}
      />
    </div>
  );
};

export default Crosshair;