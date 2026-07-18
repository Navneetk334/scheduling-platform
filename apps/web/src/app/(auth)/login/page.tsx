'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
} from '@invincible/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { signIn } from '@/lib/auth-client';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setFormError(error.message ?? 'Unable to sign in. Check your credentials.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your INVINCIBLE PROS account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {formError ? (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <Field id="email" label="Email" error={errors.email?.message} required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>

          <Field id="password" label="Password" error={errors.password?.message} required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              invalid={Boolean(errors.password)}
              {...register('password')}
            />
          </Field>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
