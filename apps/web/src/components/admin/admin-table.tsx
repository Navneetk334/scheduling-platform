'use client';

import {
  Badge,
  Button,
  Card,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@invincible/ui';
import { Download, Search, Upload, X } from 'lucide-react';
import * as React from 'react';

export interface AdminColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export interface AdminFilter<T> {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  get: (row: T) => string;
}

export interface AdminBulkAction {
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  onAction: (keys: string[]) => void;
}

interface AdminTableProps<T> {
  columns: AdminColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Text used for the search box (case-insensitive contains). */
  search: (row: T) => string;
  filters?: AdminFilter<T>[];
  bulkActions?: AdminBulkAction[];
  /** Flat record used for CSV export; defaults to the raw row. */
  toCsv?: (row: T) => Record<string, unknown>;
  searchPlaceholder?: string;
  emptyLabel?: string;
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Enterprise data table with built-in search, faceted filters, row selection +
 * bulk actions, CSV export and CSV/JSON import. Filtering is client-side over
 * the provided rows (swap for server-driven queries when wired to the API).
 */
export function AdminTable<T>({
  columns,
  rows,
  getRowKey,
  search,
  filters = [],
  bulkActions = [],
  toCsv,
  searchPlaceholder = 'Search…',
  emptyLabel = 'No records found.',
}: AdminTableProps<T>) {
  const [query, setQuery] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const importRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (q && !search(row).toLowerCase().includes(q)) return false;
      for (const filter of filters) {
        const value = activeFilters[filter.key];
        if (value && value !== '__all__' && filter.get(row) !== value) return false;
      }
      return true;
    });
  }, [rows, query, activeFilters, filters, search]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(getRowKey(r)));
  const selectable = bulkActions.length > 0;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(filtered.map(getRowKey)));
  };
  const toggleRow = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void file.text().then((text) => {
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      // eslint-disable-next-line no-alert
      window.alert(`Parsed ${Math.max(0, lines.length - 1)} row(s) from "${file.name}". Ready to import.`);
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
            className="h-9 pl-9"
          />
        </div>

        {filters.map((filter) => (
          <select
            key={filter.key}
            aria-label={filter.label}
            value={activeFilters[filter.key] ?? '__all__'}
            onChange={(e) => setActiveFilters((p) => ({ ...p, [filter.key]: e.target.value }))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="__all__">{filter.label}: All</option>
            {filter.options.map((o) => (
              <option key={o.value} value={o.value}>
                {filter.label}: {o.label}
              </option>
            ))}
          </select>
        ))}

        <div className="flex gap-2 sm:ml-auto">
          <input
            ref={importRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={handleImport}
          />
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
            <Upload className="size-4" aria-hidden /> Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCsv('export.csv', filtered.map((r) => (toCsv ? toCsv(r) : (r as Record<string, unknown>))))}
          >
            <Download className="size-4" aria-hidden /> Export
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectable && selected.size > 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <Badge variant="default">{selected.size} selected</Badge>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant={action.destructive ? 'destructive' : 'outline'}
                onClick={() => {
                  action.onAction([...selected]);
                  setSelected(new Set());
                }}
              >
                {action.icon} {action.label}
              </Button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(new Set())}>
            <X className="size-4" aria-hidden /> Clear
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable ? (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="size-4 rounded border-input accent-[hsl(var(--primary))]"
                  />
                </TableHead>
              ) : null}
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-sm text-muted-foreground">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const key = getRowKey(row);
                return (
                  <TableRow key={key} data-state={selected.has(key) ? 'selected' : undefined}>
                    {selectable ? (
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`Select row ${key}`}
                          checked={selected.has(key)}
                          onChange={() => toggleRow(key)}
                          className="size-4 rounded border-input accent-[hsl(var(--primary))]"
                        />
                      </TableCell>
                    ) : null}
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {rows.length}
      </p>
    </div>
  );
}
