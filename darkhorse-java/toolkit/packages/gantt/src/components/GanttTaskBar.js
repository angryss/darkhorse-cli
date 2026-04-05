import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * GanttTaskBar - Individual task bar with progress and interaction
 */
import { useCallback, useState, useRef } from 'react';
import styles from '../GanttChart.module.css';
export const GanttTaskBar = ({ task, left, width, height, isSelected, isSummary, showBaseline, readOnly, onClick, onChange, }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(null);
    const dragStartRef = useRef({ x: 0, left: 0, width: 0 });
    const progress = task.progress || 0;
    // Handle task bar click
    const handleClick = useCallback((e) => {
        e.stopPropagation();
        onClick();
    }, [onClick]);
    // Handle drag start
    const handleMouseDown = useCallback((e) => {
        if (readOnly)
            return;
        e.stopPropagation();
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, left, width };
        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - dragStartRef.current.x;
            const newLeft = dragStartRef.current.left + deltaX;
            // Update task - this would need to convert pixels back to dates
            // For now, we'll just trigger onChange with updated task
            onChange({ ...task, meta: { ...task.meta, visualLeft: newLeft } });
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [readOnly, left, width, task, onChange]);
    // Handle resize start
    const handleResizeStart = useCallback((e, side) => {
        if (readOnly)
            return;
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(side);
        dragStartRef.current = { x: e.clientX, left, width };
        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - dragStartRef.current.x;
            if (side === 'left') {
                const newLeft = dragStartRef.current.left + deltaX;
                const newWidth = dragStartRef.current.width - deltaX;
                if (newWidth > 20) {
                    onChange({ ...task, meta: { ...task.meta, visualLeft: newLeft, visualWidth: newWidth } });
                }
            }
            else {
                const newWidth = dragStartRef.current.width + deltaX;
                if (newWidth > 20) {
                    onChange({ ...task, meta: { ...task.meta, visualWidth: newWidth } });
                }
            }
        };
        const handleMouseUp = () => {
            setIsResizing(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [readOnly, left, width, task, onChange]);
    const barStyle = {
        left,
        width,
        height,
        top: '50%',
        transform: 'translateY(-50%)',
    };
    const barClasses = [
        styles.taskBar,
        isSelected ? styles.taskBarSelected : '',
        isSummary ? styles.taskBarSummary : '',
        isDragging || isResizing ? styles.taskBarDragging : '',
    ]
        .filter(Boolean)
        .join(' ');
    return (_jsxs(_Fragment, { children: [showBaseline && task.baselineStartDate && task.baselineEndDate && (_jsx("div", { className: styles.taskBarBaseline, style: {
                    ...barStyle,
                    height: height * 0.5,
                } })), _jsxs("div", { className: barClasses, style: barStyle, onClick: handleClick, onMouseDown: readOnly ? undefined : handleMouseDown, role: "button", tabIndex: 0, "aria-label": `Task: ${task.name}`, title: `${task.name} (${progress}%)`, children: [progress > 0 && (_jsx("div", { className: styles.taskBarProgress, style: { width: `${Math.min(100, progress)}%` } })), _jsx("span", { className: styles.taskBarLabel, children: task.name }), !readOnly && !isSummary && (_jsxs(_Fragment, { children: [_jsx("div", { className: `${styles.taskBarHandle} ${styles.taskBarHandleLeft}`, onMouseDown: (e) => handleResizeStart(e, 'left'), "aria-label": "Resize left" }), _jsx("div", { className: `${styles.taskBarHandle} ${styles.taskBarHandleRight}`, onMouseDown: (e) => handleResizeStart(e, 'right'), "aria-label": "Resize right" })] }))] })] }));
};
//# sourceMappingURL=GanttTaskBar.js.map