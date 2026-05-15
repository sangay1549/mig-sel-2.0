import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useSession } from '@/features/auth/api/use-session';
import { useResetPassword } from '@/features/auth/api/use-reset-password';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/features/auth/schemas/reset-password-schema';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession();
  const resetPassword = useResetPassword();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = (values: ResetPasswordValues) => {
    resetPassword.mutate(values, {
      onSuccess: () => navigate('/login'),
    });
  };

  if (isLoading) return null;

  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="mb-2">
              <CardTitle>Invalid or expired link</CardTitle>
              <CardDescription>
                This password reset link is no longer valid. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/forgot-password">Request new link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="mb-2">
            <CardTitle>Set new password</CardTitle>
            <CardDescription>Choose a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {resetPassword.isError ? (
                  <div className="bg-destructive/10 rounded-sm px-3 py-2">
                    <p className="text-destructive text-sm">{resetPassword.error.message}</p>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="w-full hover:scale-105 hover:shadow-lg"
                  disabled={resetPassword.isPending}
                >
                  {resetPassword.isPending ? 'Resetting\u2026' : 'Reset password'}
                </Button>
              </form>
            </Form>

            <p className="text-muted-foreground/40 text-center text-xs">
              <Link to="/login" className="hover:text-muted-foreground/70">
                &larr; Back to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
