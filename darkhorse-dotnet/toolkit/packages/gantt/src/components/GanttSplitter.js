import { jsx as _jsx } from "react/jsx-runtime";
/**
 * GanttSplitter - Resizable splitter between grid and timeline
 */
import { useCallback, useRef, useState } from 'react';
import styles from '../GanttChart.module.css';
export const GanttSplitter = ({ position, onResize, }) => {
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const startPosRef = useRef(0);
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
        startXRef.current = e.clientX;
        startPosRef.current = position;
        const handleMouseMove = (moveEvent) => {
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
    return (_jsx("div", { className: `${styles.splitter} ${isDragging ? styles.splitterDragging : ''}`, onMouseDown: handleMouseDown, role: "separator", "aria-orientation": "vertical", "aria-label": "Resize grid and timeline", tabIndex: 0, children: _jsx("div", { className: styles.splitterHandle }) }));
};
//# sourceMappingURL=GanttSplitter.js.map