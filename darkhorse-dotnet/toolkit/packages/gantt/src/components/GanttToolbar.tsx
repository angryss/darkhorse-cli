/**
 * GanttToolbar - Action toolbar for Gantt operations
 */

import React from 'react';
import type { GanttToolbarAction } from '../types';
import styles from '../GanttChart.module.css';

export interface GanttToolbarProps {
  actions: GanttToolbarAction[];
  onAction: (action: GanttToolbarAction) => void;
}

const actionLabels: Record<GanttToolbarAction, string> = {
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

const actionIcons: Record<GanttToolbarAction, string> = {
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

export const GanttToolbar: React.FC<GanttToolbarProps> = ({ actions, onAction }) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Gantt chart actions">
      {actions.map((action) => (
        <button
          key={action}
          className={styles.toolbarButton}
          onClick={() => onAction(action)}
          aria-label={actionLabels[action]}
          title={actionLabels[action]}
        >
          <span className={styles.toolbarButtonIcon}>{actionIcons[action]}</span>
          <span className={styles.toolbarButtonLabel}>{actionLabels[action]}</span>
        </button>
      ))}
    </div>
  );
};

