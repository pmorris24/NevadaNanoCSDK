// src/components/CodeHighlighter.tsx
import React, { useState, useEffect, useRef } from 'react';
import './CodeHighlighter.css';

interface CodeHighlighterProps {
  code: string;
  lastChangedKey: string | null;
}

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ code }) => {
  const [isChanged, setIsChanged] = useState(false);
  const [changedLines, setChangedLines] = useState<Set<number>>(new Set());
  const prevCodeRef = useRef<string>(code);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the effect on the initial render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Check if the code has actually changed
    if (prevCodeRef.current !== code) {
      // 1. Trigger the orange glow effect
      setIsChanged(true);
      const glowTimer = setTimeout(() => setIsChanged(false), 750); // Glow lasts for 750ms

      // 2. Find which lines have changed
      const oldLines = prevCodeRef.current.split('\n');
      const newLines = code.split('\n');
      const changed = new Set<number>();

      const maxLines = Math.max(oldLines.length, newLines.length);
      for (let i = 0; i < maxLines; i++) {
        if (oldLines[i] !== newLines[i]) {
          changed.add(i);
        }
      }
      setChangedLines(changed);

      // 3. Clear the red text highlight after a short delay
      const lineHighlightTimer = setTimeout(() => {
        setChangedLines(new Set());
      }, 1500); // Highlight lasts for 1.5 seconds

      // Update the previous code reference
      prevCodeRef.current = code;

      // Cleanup timers on unmount or re-run
      return () => {
        clearTimeout(glowTimer);
        clearTimeout(lineHighlightTimer);
      };
    }
  }, [code]);

  const lines = code.split('\n');

  return (
    <pre
      className={`code-highlighter-overlay ${
        isChanged ? 'highlight-glow' : ''
      }`}
    >
      <code>
        {lines.map((line, index) => {
          const isLineChanged = changedLines.has(index);
          // Apply a class to highlight the changed line's text
          return (
            <span
              key={index}
              className={isLineChanged ? 'highlight-text-red' : ''}
            >
              {line}
              {'\n'}
            </span>
          );
        })}
      </code>
    </pre>
  );
};

export default CodeHighlighter;
