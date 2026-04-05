/**
 * Pivot Engine - Core aggregation logic
 */

import type {
  PivotRecord,
  PivotConfig,
  PivotMatrix,
  PivotCellData,
  PivotValueField,
} from './types';

/**
 * Build pivot matrix from data and configuration
 */
export function buildPivotMatrix(data: PivotRecord[], config: PivotConfig): PivotMatrix {
  // Apply filters
  const filteredData = applyFilters(data, config);
  
  // Extract unique values for rows and columns
  const rowValues = extractUniqueValues(filteredData, config.rows);
  const columnValues = extractUniqueValues(filteredData, config.columns);
  
  // Ensure we have at least one value field
  const firstValueField = config.values[0];
  if (!firstValueField) {
    throw new Error('At least one value field is required');
  }
  
  // Build cells matrix
  const cells: PivotCellData[][] = [];
  
  for (let rowIdx = 0; rowIdx < rowValues.length; rowIdx++) {
    const cellRow: PivotCellData[] = [];
    const rowPath = rowValues[rowIdx];
    
    if (!rowPath) continue;
    
    for (let colIdx = 0; colIdx < columnValues.length; colIdx++) {
      const columnPath = columnValues[colIdx];
      
      if (!columnPath) continue;
      
      // Get records matching this row/column combination
      const matchingRecords = getMatchingRecords(filteredData, config, rowPath, columnPath);
      
      // Aggregate for each value field
      const cellData = aggregateRecords(matchingRecords, firstValueField, rowPath, columnPath);
      cellRow.push(cellData);
    }
    
    cells.push(cellRow);
  }
  
  // Calculate grand totals
  const grandTotalRow = calculateGrandTotalRow(filteredData, columnValues, config);
  const grandTotalColumn = calculateGrandTotalColumn(filteredData, rowValues, config);
  const grandTotal = aggregateRecords(filteredData, firstValueField, [], []);
  
  return {
    rowHeaders: rowValues,
    columnHeaders: columnValues,
    cells,
    grandTotalRow,
    grandTotalColumn,
    grandTotal,
  };
}

/**
 * Apply filters to data
 */
function applyFilters(data: PivotRecord[], config: PivotConfig): PivotRecord[] {
  if (!config.filters || config.filters.length === 0) {
    return data;
  }
  
  return data.filter(record => {
    return config.filters!.every(filter => {
      const value = record[filter.field];
      
      if (!filter.items || filter.items.length === 0) {
        return true;
      }
      
      const isIncluded = filter.items.includes(value as string | number);
      return filter.filterType === 'exclude' ? !isIncluded : isIncluded;
    });
  });
}

/**
 * Extract unique value combinations for fields
 */
function extractUniqueValues(data: PivotRecord[], fields: { field: string }[]): string[][] {
  if (fields.length === 0) {
    return [[]];
  }
  
  const uniqueValues = new Set<string>();
  
  for (const record of data) {
    const path = fields.map(f => String(record[f.field] ?? ''));
    uniqueValues.add(path.join('|'));
  }
  
  return Array.from(uniqueValues)
    .map(key => key.split('|'))
    .sort();
}

/**
 * Get records matching row and column paths
 */
function getMatchingRecords(
  data: PivotRecord[],
  config: PivotConfig,
  rowPath: string[],
  columnPath: string[]
): PivotRecord[] {
  return data.filter(record => {
    // Check row fields
    const rowMatch = config.rows.every((field, idx) => {
      return String(record[field.field] ?? '') === rowPath[idx];
    });
    
    // Check column fields
    const columnMatch = config.columns.every((field, idx) => {
      return String(record[field.field] ?? '') === columnPath[idx];
    });
    
    return rowMatch && columnMatch;
  });
}

/**
 * Aggregate records for a single cell
 */
function aggregateRecords(
  records: PivotRecord[],
  valueField: PivotValueField,
  rowPath: string[],
  columnPath: string[]
): PivotCellData {
  const values = records
    .map(r => r[valueField.field])
    .filter(v => typeof v === 'number') as number[];
  
  let value: number | null = null;
  
  if (values.length > 0) {
    switch (valueField.aggregation) {
      case 'sum':
        value = values.reduce((sum, v) => sum + v, 0);
        break;
      case 'avg':
        value = values.reduce((sum, v) => sum + v, 0) / values.length;
        break;
      case 'min':
        value = Math.min(...values);
        break;
      case 'max':
        value = Math.max(...values);
        break;
      case 'count':
        value = values.length;
        break;
      case 'distinctCount':
        value = new Set(values).size;
        break;
    }
  }
  
  return {
    rowPath,
    columnPath,
    value,
    formattedValue: formatValue(value, valueField.format),
    count: records.length,
    records,
  };
}

/**
 * Calculate grand total row
 */
function calculateGrandTotalRow(
  data: PivotRecord[],
  columnValues: string[][],
  config: PivotConfig
): PivotCellData[] {
  const firstValueField = config.values[0];
  if (!firstValueField) return [];
  
  return columnValues.map(columnPath => {
    if (!columnPath) return aggregateRecords([], firstValueField, [], []);
    
    const matchingRecords = data.filter(record => {
      return config.columns.every((field, idx) => {
        return String(record[field.field] ?? '') === columnPath[idx];
      });
    });
    
    return aggregateRecords(matchingRecords, firstValueField, [], columnPath);
  });
}

/**
 * Calculate grand total column
 */
function calculateGrandTotalColumn(
  data: PivotRecord[],
  rowValues: string[][],
  config: PivotConfig
): PivotCellData[] {
  const firstValueField = config.values[0];
  if (!firstValueField) return [];
  
  return rowValues.map(rowPath => {
    if (!rowPath) return aggregateRecords([], firstValueField, [], []);
    
    const matchingRecords = data.filter(record => {
      return config.rows.every((field, idx) => {
        return String(record[field.field] ?? '') === rowPath[idx];
      });
    });
    
    return aggregateRecords(matchingRecords, firstValueField, rowPath, []);
  });
}

/**
 * Format value based on format string
 */
function formatValue(value: number | null, format?: string): string {
  if (value === null) {
    return '-';
  }
  
  if (!format) {
    return value.toLocaleString();
  }
  
  // Simple format handling
  if (format === 'percent') {
    return `${(value * 100).toFixed(2)}%`;
  }
  
  if (format.startsWith('0.')) {
    const decimals = format.length - 2;
    return value.toFixed(decimals);
  }
  
  return value.toLocaleString();
}

/**
 * Export pivot matrix to CSV
 */
export function exportToCSV(matrix: PivotMatrix): string {
  const lines: string[] = [];
  
  // Header row
  const headerCells = [''];
  for (const colPath of matrix.columnHeaders) {
    if (colPath) {
      headerCells.push(colPath.join(' / '));
    }
  }
  if (matrix.grandTotalColumn) {
    headerCells.push('Grand Total');
  }
  lines.push(headerCells.join(','));
  
  // Data rows
  for (let rowIdx = 0; rowIdx < matrix.rowHeaders.length; rowIdx++) {
    const rowPath = matrix.rowHeaders[rowIdx];
    if (!rowPath) continue;
    
    const cells = [rowPath.join(' / ')];
    
    const cellRow = matrix.cells[rowIdx];
    if (cellRow) {
      for (const cell of cellRow) {
        cells.push(cell.formattedValue);
      }
    }
    
    if (matrix.grandTotalColumn) {
      const totalCell = matrix.grandTotalColumn[rowIdx];
      if (totalCell) {
        cells.push(totalCell.formattedValue);
      }
    }
    
    lines.push(cells.join(','));
  }
  
  // Grand total row
  if (matrix.grandTotalRow) {
    const cells = ['Grand Total'];
    for (const cell of matrix.grandTotalRow) {
      cells.push(cell.formattedValue);
    }
    if (matrix.grandTotal) {
      cells.push(matrix.grandTotal.formattedValue);
    }
    lines.push(cells.join(','));
  }
  
  return lines.join('\n');
}

