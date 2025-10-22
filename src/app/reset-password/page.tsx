
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .max(100),
    confirmPassword: z.string().max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type PageState = 'verifying' | 'valid' | 'invalid' | 'success' | 'error';

export default function ResetPasswordPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const oobCode = useMemo(() => searchParams.get('oobCode'), [searchParams]);

  const [pageState, setPageState] = useState<PageState>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (!oobCode) {
      setPageState('invalid');
      setErrorMessage('Invalid or missing password reset code.');
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setPageState('valid');
      })
      .catch((error) => {
        setPageState('invalid');
        setErrorMessage('Your password reset link is invalid or has expired. Please try again.');
      });
  }, [auth, oobCode]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (pageState !== 'valid' || !oobCode) return;

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      setPageState('success');
    } catch (error) {
      setPageState('error');
      setErrorMessage('An unexpected error occurred. Please request a new link and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const renderContent = () => {
    switch (pageState) {
      case 'verifying':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold">Verifying Link...</h2>
            <p className="mt-2 text-muted-foreground">Please wait while we check your password reset link.</p>
          </div>
        );
      case 'invalid':
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Link Invalid or Expired</h2>
            <p className="mt-2 text-muted-foreground">{errorMessage}</p>
            <Button asChild className="mt-6">
              <Link href="/forgot-password">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Request a New Link
              </Link>
            </Button>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold">Password Reset Successful</h2>
            <p className="mt-2 text-muted-foreground">You can now sign in with your new password.</p>
            <Button asChild className="mt-6">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        );
      case 'valid':
        return (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Reset Your Password</h2>
              <p className="mt-2 text-muted-foreground">
                Create a new strong password for your account.
              </p>
            </div>
            <div className="mt-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your new password"
                              {...field}
                              disabled={isLoading}
                              className="ps-9 pe-10"
                              maxLength={100}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowPassword((prev) => !prev)}
                                >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your new password"
                                {...field}
                                disabled={isLoading}
                                className="ps-9 pe-10"
                                maxLength={100}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !form.formState.isValid}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {renderContent()}
      </div>
    </div>
  );
}
