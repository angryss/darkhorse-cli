/**
 * GanttSplitter - Resizable splitter between grid and timeline
 */

import React, { useCallback, useRef, useState } from 'react';
import styles from '../GanttChart.module.css';

export interface GanttSplitterProps {
  position: number;
  onResize: (position: number) => void;
}

export const GanttSplitter: React.FC<GanttSplitterProps> = ({
  position,
  onResize,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startPosRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startPosRef.current = position;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      const newPosition = Math.max(200, Math.min(800, startPosRef.current + deltaX));
      onResize(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, onResize]);

  return (
    <div
      className={`${styles.splitter} ${isDragging ? styles.splitterDragging : ''}`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize grid and timeline"
      tabIndex={0}
    >
      <div className={styles.splitterHandle} />
    </div>
  );
};

