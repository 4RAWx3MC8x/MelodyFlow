
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
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import Link from 'next/link';
import { User, Mail, KeyRound, Eye, EyeOff, Loader2, MailCheck, ShieldCheck } from 'lucide-react';

const formSchema = z.object({
  displayName: z.string().min(3, { message: 'Name must be at least 3 characters.' }).max(50, { message: 'Name cannot be longer than 50 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }).max(254),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' }).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { data: user, isLoading: isUserLoading } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
    mode: 'onChange',
  });
  
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await updateProfile(userCredential.user, {
        displayName: values.displayName,
      });
      await sendEmailVerification(userCredential.user);

      setSubmittedEmail(values.email);
      setEmailSent(true);
      
    } catch (error) {
      let description = 'An unexpected error occurred.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          description = 'This email is already in use. Try logging in.';
        }
      }
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isUserLoading || user) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground">
              {emailSent ? "Check Your Inbox" : "Create an Account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {emailSent 
                ? `We've sent a verification link to ${submittedEmail}.`
                : (
                  <>
                  Or{' '}
                  <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                    sign in to your existing account
                  </Link>
                  </>
                )
              }
            </p>
          </div>

          {emailSent ? (
              <div className="text-center p-8 flex flex-col items-center">
                <MailCheck className="h-16 w-16 text-green-500 mb-4"/>
                <Button asChild>
                  <Link href="/login">Back to Sign In</Link>
                </Button>
              </div>
          ) : (
            <div className="mt-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Full Name</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter your full name" {...field} className="ps-9" maxLength={50} disabled={isSubmitting}/>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Email address</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter your email address" {...field} className="ps-9" maxLength={254} disabled={isSubmitting}/>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password" 
                                    {...field} 
                                    className="ps-9 pe-10" 
                                    maxLength={100} 
                                    disabled={isSubmitting}
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

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting || !form.formState.isValid}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? 'Creating account...' : 'Create account'}
                    </Button>
                  </div>
                </form>
              </Form>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure & Trusted End-to-End Encryption</span>
              </div>
            </div>
           )}
        </div>
    </div>
  );
}
