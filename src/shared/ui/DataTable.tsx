import React from 'react';

export interface Column<Row> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render: (row: Row, index: number) => React.ReactNode;
}

interface DataTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  onRowClick?: (row: Row) => void;
  isRowActive?: (row: Row) => boolean;
  emptyState?: React.ReactNode;
  /** Caption shown above the table. */
  caption?: React.ReactNode;
  className?: string;
}

/** Shared table chrome — one header/row/empty-state treatment for all lists. */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isRowActive,
  emptyState,
  caption,
  className
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-surface-subtle p-6 text-center text-sm text-purple-500">
        {emptyState ?? 'No records yet.'}
      </div>
    );
  }

  return (
    <div className={['overflow-x-auto', className ?? ''].join(' ').trim()}>
      {caption && (
        <div className="text-2xs font-semibold uppercase tracking-wider text-purple-500 mb-2">
          {caption}
        </div>
      )}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-line-strong">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={[
                  'py-1.5 px-3 whitespace-nowrap font-mono text-2xs uppercase tracking-[0.08em]',
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                ].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={[
                'border-b border-line transition-colors',
                onRowClick ? 'cursor-pointer' : '',
                isRowActive?.(row)
                  ? 'bg-brand-50'
                  : 'hover:bg-purple-50'
              ].join(' ').trim()}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[
                    'py-2 px-3 align-middle text-navy-700',
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  ].join(' ')}
                >
                  {col.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
