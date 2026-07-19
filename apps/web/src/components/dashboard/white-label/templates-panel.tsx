'use client';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Skeleton,
} from '@invincible/ui';
import type { MessageTemplate } from '@invincible/types';
import { Mail, MessageSquare, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { EmptyState } from '@/components/dashboard/empty-state';
import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
} from '@/hooks/use-white-label';

import { Select, Textarea } from './textarea';

const TEMPLATE_TYPES = [
  'BOOKING_CONFIRMATION',
  'BOOKING_REMINDER',
  'BOOKING_RESCHEDULED',
  'BOOKING_CANCELLED',
  'BOOKING_FOLLOW_UP',
  'WAITLIST_CONFIRMATION',
  'PAYMENT_RECEIPT',
  'INVOICE_ISSUED',
  'TEAM_INVITE',
  'WELCOME',
  'PASSWORD_RESET',
  'CUSTOM',
] as const;

const prettyType = (t: string) =>
  t
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export function TemplatesPanel({
  organizationId,
  channel,
}: {
  organizationId: string | undefined;
  channel: 'EMAIL' | 'SMS';
}) {
  const { data, isLoading, isError, error } = useTemplates(organizationId);
  const createTemplate = useCreateTemplate(organizationId);

  const templates = React.useMemo(
    () => (data ?? []).filter((t) => t.channel === channel),
    [data, channel],
  );

  const [type, setType] = React.useState<(typeof TEMPLATE_TYPES)[number]>('BOOKING_CONFIRMATION');
  const [name, setName] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [bodyText, setBodyText] = React.useState('');
  const [bodyHtml, setBodyHtml] = React.useState('');

  const isEmail = channel === 'EMAIL';

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTemplate.mutate(
      {
        channel,
        type,
        name: name.trim(),
        subject: isEmail ? subject.trim() : null,
        bodyText: bodyText.trim(),
        bodyHtml: isEmail ? bodyHtml.trim() || null : null,
      },
      {
        onSuccess: () => {
          setName('');
          setSubject('');
          setBodyText('');
          setBodyHtml('');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New {isEmail ? 'email' : 'SMS'} template</CardTitle>
          <CardDescription>
            Use <code className="rounded bg-muted px-1">{'{{variable}}'}</code> tokens, e.g.{' '}
            <code className="rounded bg-muted px-1">{'{{guestName}}'}</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="tpl-type" label="Message">
                <Select id="tpl-type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                  {TEMPLATE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {prettyType(t)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="tpl-name" label="Template name">
                <Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Confirmation email" />
              </Field>
            </div>
            {isEmail ? (
              <Field id="tpl-subject" label="Subject">
                <Input id="tpl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your booking is confirmed, {{guestName}}" />
              </Field>
            ) : null}
            <Field id="tpl-text" label={isEmail ? 'Plain-text body' : 'Message body'}>
              <Textarea id="tpl-text" value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={isEmail ? 3 : 4} />
            </Field>
            {isEmail ? (
              <Field id="tpl-html" label="HTML body (optional)">
                <Textarea id="tpl-html" value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} rows={5} className="font-mono text-xs" />
              </Field>
            ) : null}
            <Button type="submit" disabled={createTemplate.isPending || !name.trim() || !bodyText.trim()}>
              <Plus className="size-4" /> {createTemplate.isPending ? 'Saving…' : 'Create template'}
            </Button>
            {createTemplate.isError ? (
              <Alert variant="destructive">
                <AlertDescription>{(createTemplate.error as Error)?.message}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error)?.message ?? 'Failed to load templates.'}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : templates.length > 0 ? (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <TemplateRow key={tpl.id} template={tpl} organizationId={organizationId} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={isEmail ? Mail : MessageSquare}
          title={`No ${isEmail ? 'email' : 'SMS'} templates`}
          description="Create a template to brand your notifications."
        />
      )}
    </div>
  );
}

function TemplateRow({ template, organizationId }: { template: MessageTemplate; organizationId: string | undefined }) {
  const deleteTemplate = useDeleteTemplate(organizationId);
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{template.name}</span>
            <Badge variant="secondary">{prettyType(template.type)}</Badge>
            {!template.isActive ? <Badge variant="outline">Inactive</Badge> : null}
          </div>
          {template.subject ? <p className="mt-1 truncate text-sm text-muted-foreground">{template.subject}</p> : null}
        </div>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteTemplate.mutate(template.id)} aria-label={`Delete ${template.name}`}>
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </CardContent>
    </Card>
  );
}
