import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
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
import { useForgotPassword } from '@/features/auth/api/use-forgot-password';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/features/auth/schemas/forgot-password-schema';

export const ForgotPasswordPage = () => {
  const forgotPassword = useForgotPassword();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    forgotPassword.mutate(values);
  };

  const isSuccess = forgotPassword.isSuccess;

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="mb-2">
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              {isSuccess
                ? 'Check your email for the reset link.'
                : "Enter your email and we'll send you a reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isSuccess ? (
              <div className="space-y-5">
                <div className="bg-primary/10 rounded-sm px-3 py-2">
                  <p className="text-primary text-sm">
                    If an account with that email exists, you'll receive a password reset link
                    shortly.
                  </p>
                </div>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {forgotPassword.isError ? (
                    <div className="bg-destructive/10 rounded-sm px-3 py-2">
                      <p className="text-destructive text-sm">{forgotPassword.error.message}</p>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    className="w-full hover:scale-105 hover:shadow-lg"
                    disabled={forgotPassword.isPending}
                  >
                    {forgotPassword.isPending ? 'Sending\u2026' : 'Send reset link'}
                  </Button>
                </form>
              </Form>
            )}

            <p className="text-muted-foreground text-center text-sm">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-semibold underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>

            <p className="text-muted-foreground/40 text-center text-xs">
              <Link to="/" className="hover:text-muted-foreground/70">
                &larr; Back to home
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
