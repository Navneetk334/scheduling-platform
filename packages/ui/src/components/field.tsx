import * as React from 'react';

import { cn } from '../lib/cn';

import { Label } from './label';

export interface FieldProps {
  id: string;
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Accessible form field wrapper: associates the label, optional description
 * and error message with the control via `aria-describedby`.
 */
export function Field({
  id,
  label,
  error,
  description,
  required,
  className,
  children,
}: FieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {description && !error ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
