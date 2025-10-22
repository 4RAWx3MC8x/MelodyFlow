
'use client';

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
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/firebase';
import { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Mail } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setSubmittedEmail(values.email);
      setIsSubmitted(true);
    } catch (error) {
      let description = 'An unexpected error occurred.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') {
          description = 'No user found with this email address.';
        }
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {isSubmitted ? (
            <div className="text-center mt-8">
                <h2 className="text-2xl font-bold">Check your email</h2>
                <p className="mt-2 text-muted-foreground">
                    We've sent a password reset link to <span className='font-medium text-foreground'>{submittedEmail}</span>.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sign In
                    </Link>
                </Button>
            </div>
        ) : (
          <>
            <div className="text-center">
                <h2 className="text-2xl font-bold">Forgot your password?</h2>
                <p className="mt-2 text-muted-foreground">
                No worries, we'll send you reset instructions.
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='sr-only'>Email address</FormLabel>
                        <FormControl>
                            <div className='relative'>
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Enter your email address"
                                    {...field}
                                    disabled={isLoading}
                                    maxLength={254}
                                    className="ps-9"
                                />
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
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                <Link href="/login" className="font-medium text-primary hover:text-primary/90 inline-flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                </Link>
              </div>
            </div>
           </>
        )}
      </div>
    </div>
  );
}
