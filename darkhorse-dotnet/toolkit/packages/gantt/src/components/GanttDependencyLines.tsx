/**
 * GanttDependencyLines - SVG lines connecting dependent tasks
 */

import React, { useMemo } from 'react';
import type { TaskTreeNode, DependencyType } from '../types';
import { parseDependencies } from '../utils/dependencyUtils';
import { calculateTaskDates } from '../utils/taskUtils';
import styles from '../GanttChart.module.css';

export interface GanttDependencyLinesProps {
  nodes: TaskTreeNode[];
  rowHeight: number;
  getPosition: (date: Date) => number;
  pixelsPerDay: number;
}

interface DependencyLine {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: DependencyType;
}

export const GanttDependencyLines: React.FC<GanttDependencyLinesProps> = ({
  nodes,
  rowHeight,
  getPosition,
  pixelsPerDay,
}) => {
  // Build task map for quick lookup
  const taskMap = useMemo(() => {
    const map = new Map<string | number, { node: TaskTreeNode; index: number }>();
    nodes.forEach((node, index) => {
      map.set(node.task.id, { node, index });
    });
    return map;
  }, [nodes]);

  // Calculate all dependency lines
  const lines = useMemo(() => {
    const result: DependencyLine[] = [];

    nodes.forEach((node, toIndex) => {
      const dependencies = parseDependencies(node.task.dependency);
      
      dependencies.forEach((dep) => {
        const fromData = taskMap.get(dep.taskId);
        if (!fromData) return;

        const fromNode = fromData.node;
        const fromIndex = fromData.index;

        const fromDates = calculateTaskDates(fromNode.task);
        const toDates = calculateTaskDates(node.task);

        if (!fromDates.startDate || !fromDates.endDate || !toDates.startDate || !toDates.endDate) {
          return;
        }

        // Calculate line endpoints based on dependency type
        let fromX: number;
        let toX: number;

        switch (dep.type) {
          case 'FS': // Finish-to-Start
            fromX = getPosition(fromDates.endDate) + pixelsPerDay;
            toX = getPosition(toDates.startDate);
            break;
          case 'SS': // Start-to-Start
            fromX = getPosition(fromDates.startDate);
            toX = getPosition(toDates.startDate);
            break;
          case 'FF': // Finish-to-Finish
            fromX = getPosition(fromDates.endDate) + pixelsPerDay;
            toX = getPosition(toDates.endDate) + pixelsPerDay;
            break;
          case 'SF': // Start-to-Finish
            fromX = getPosition(fromDates.startDate);
            toX = getPosition(toDates.endDate) + pixelsPerDay;
            break;
        }

        const fromY = fromIndex * rowHeight + rowHeight / 2;
        const toY = toIndex * rowHeight + rowHeight / 2;

        result.push({
          from: { x: fromX, y: fromY },
          to: { x: toX, y: toY },
          type: dep.type,
        });
      });
    });

    return result;
  }, [nodes, taskMap, rowHeight, getPosition, pixelsPerDay]);

  if (lines.length === 0) {
    return null;
  }

  // Calculate SVG dimensions
  const maxX = Math.max(...lines.flatMap((l) => [l.from.x, l.to.x])) + 50;
  const maxY = Math.max(...lines.flatMap((l) => [l.from.y, l.to.y])) + 50;

  return (
    <svg
      className={styles.dependencyLines}
      width={maxX}
      height={maxY}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    >
      {lines.map((line, index) => {
        const { from, to } = line;
        
        // Create path with right-angle connectors
        const midX = (from.x + to.x) / 2;
        const path = `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;

        return (
          <g key={index}>
            {/* Dependency line */}
            <path
              d={path}
              className={styles.dependencyLine}
              stroke="#666"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      })}

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#666" />
        </marker>
      </defs>
    </svg>
  );
};

