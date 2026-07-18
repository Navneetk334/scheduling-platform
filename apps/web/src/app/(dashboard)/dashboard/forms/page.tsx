'use client';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@invincible/ui';
import { FileText, Plus } from 'lucide-react';
import * as React from 'react';

import { FadeItem, Stagger } from '@/components/dashboard/motion';
import { PageHeader } from '@/components/dashboard/page-header';

interface FormRow {
  id: string;
  name: string;
  description: string;
  questions: number;
  usedBy: number;
}

const forms: FormRow[] = [
  { id: '1', name: 'Intro Call Intake', description: 'Collect context before a first call.', questions: 4, usedBy: 2 },
  { id: '2', name: 'Demo Qualification', description: 'Qualify demo requests with routing questions.', questions: 6, usedBy: 1 },
  { id: '3', name: 'Support Triage', description: 'Gather details for support sessions.', questions: 3, usedBy: 1 },
];

export default function FormsPage() {
  return (
    <div>
      <PageHeader
        title="Forms"
        description="Custom booking questions attached to your meeting types."
        actions={
          <Button size="sm">
            <Plus className="size-4" /> New form
          </Button>
        }
      />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {forms.map((f) => (
          <FadeItem key={f.id}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-4" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{f.name}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">{f.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Badge variant="secondary">{f.questions} questions</Badge>
                <Badge variant="outline">{f.usedBy} meeting types</Badge>
              </CardContent>
            </Card>
          </FadeItem>
        ))}
      </Stagger>
    </div>
  );
}
