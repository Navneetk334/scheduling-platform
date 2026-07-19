'use client';

import { Button, Input, cn } from '@invincible/ui';
import { CheckCircle2 } from 'lucide-react';
import * as React from 'react';

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [values, setValues] = React.useState({ name: '', email: '', company: '', message: '' });
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitted, setSubmitted] = React.useState(false);

  const update = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!values.name.trim()) next.name = 'Please enter your name.';
    if (!emailPattern.test(values.email)) next.email = 'Enter a valid email address.';
    if (values.message.trim().length < 10) next.message = 'Tell us a little more (at least 10 characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="flex flex-col items-center rounded-2xl border border-border bg-card/50 p-10 text-center"
      >
        <CheckCircle2 className="size-10 text-primary" aria-hidden />
        <h3 className="mt-4 text-lg font-semibold">Thanks for reaching out!</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your message is on its way to our team. We typically respond within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="cf-name"
            value={values.name}
            onChange={update('name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'cf-name-error' : undefined}
            className="mt-1.5"
            placeholder="Jordan Rivera"
          />
          {errors.name ? (
            <p id="cf-name-error" className="mt-1 text-xs text-destructive">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="cf-email" className="text-sm font-medium">
            Work email
          </label>
          <Input
            id="cf-email"
            type="email"
            value={values.email}
            onChange={update('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'cf-email-error' : undefined}
            className="mt-1.5"
            placeholder="you@company.com"
          />
          {errors.email ? (
            <p id="cf-email-error" className="mt-1 text-xs text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="cf-company" className="text-sm font-medium">
          Company <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input id="cf-company" value={values.company} onChange={update('company')} className="mt-1.5" placeholder="Acme Inc." />
      </div>

      <div className="mt-5">
        <label htmlFor="cf-message" className="text-sm font-medium">
          How can we help?
        </label>
        <textarea
          id="cf-message"
          rows={5}
          value={values.message}
          onChange={update('message')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'cf-message-error' : undefined}
          className={cn(
            'mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            errors.message && 'border-destructive',
          )}
          placeholder="Tell us about your team and what you’re looking to solve…"
        />
        {errors.message ? (
          <p id="cf-message-error" className="mt-1 text-xs text-destructive">
            {errors.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
