import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from '../GanttChart.module.css';
const actionLabels = {
    Add: '+ Add',
    Edit: 'Edit',
    Delete: 'Delete',
    ZoomIn: 'Zoom In',
    ZoomOut: 'Zoom Out',
    ZoomToFit: 'Zoom to Fit',
    Undo: 'Undo',
    Redo: 'Redo',
    ExpandAll: 'Expand All',
    CollapseAll: 'Collapse All',
};
const actionIcons = {
    Add: '+',
    Edit: '✎',
    Delete: '🗑',
    ZoomIn: '🔍+',
    ZoomOut: '🔍-',
    ZoomToFit: '⊡',
    Undo: '↶',
    Redo: '↷',
    ExpandAll: '▼',
    CollapseAll: '▶',
};
export const GanttToolbar = ({ actions, onAction }) => {
    if (!actions || actions.length === 0) {
        return null;
    }
    return (_jsx("div", { className: styles.toolbar, role: "toolbar", "aria-label": "Gantt chart actions", children: actions.map((action) => (_jsxs("button", { className: styles.toolbarButton, onClick: () => onAction(action), "aria-label": actionLabels[action], title: actionLabels[action], children: [_jsx("span", { className: styles.toolbarButtonIcon, children: actionIcons[action] }), _jsx("span", { className: styles.toolbarButtonLabel, children: actionLabels[action] })] }, action))) }));
};
//# sourceMappingURL=GanttToolbar.js.map