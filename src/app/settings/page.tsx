
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/firebase/auth/use-user"
import { useAuth } from "@/firebase"
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateProfile, deleteUser, updateEmail, sendEmailVerification, linkWithCredential } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FirebaseError } from "firebase/app"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldAlert, Trash2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useMusic } from "@/hooks/use-music"

const DISPLAY_NAME_MAX_LENGTH = 30;

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, {
      message: "Display name must be at least 2 characters.",
    })
    .max(DISPLAY_NAME_MAX_LENGTH, {
      message: `Display name must not be longer than ${DISPLAY_NAME_MAX_LENGTH} characters.`,
    }),
})

const emailFormSchema = z.object({
  newEmail: z.string().email({ message: 'Please enter a valid email.' }).max(254),
  password: z.string().min(1, { message: "Password is required to confirm." }).max(100),
});

const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required." }).max(100),
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }).max(100),
})

const addPasswordFormSchema = z.object({
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }).max(100),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>
type EmailFormValues = z.infer<typeof emailFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>
type AddPasswordFormValues = z.infer<typeof addPasswordFormSchema>;

export default function SettingsPage() {
  const { data: user } = useUser()
  const auth = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { setActiveView } = useMusic();
  
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("")

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
        displayName: user?.displayName ?? "",
    },
    mode: "onChange",
  })
  
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { newEmail: '', password: '' },
    mode: 'onChange',
  });
  
  const passwordForm = useForm<PasswordFormValues>({
      resolver: zodResolver(passwordFormSchema),
      defaultValues: {
          currentPassword: "",
          newPassword: "",
      },
      mode: "onChange",
  })

  const addPasswordForm = useForm<AddPasswordFormValues>({
      resolver: zodResolver(addPasswordFormSchema),
      defaultValues: { newPassword: "" },
      mode: "onChange",
  });

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user) return
    setIsProfileLoading(true);
    try {
        await updateProfile(user, { displayName: data.displayName })
        toast({
            title: "Profile updated",
            description: "Your display name has been updated.",
        })
        profileForm.reset({ displayName: data.displayName });
    } catch(e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update profile.",
        })
    } finally {
        setIsProfileLoading(false);
    }
  }

  async function onEmailSubmit(data: EmailFormValues) {
    if (!user || !user.email) return;

    setIsEmailLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, data.password);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, data.newEmail);
      await sendEmailVerification(user);
      toast({
        title: "Email Changed",
        description: "Your email has been updated. A verification link has been sent to your new email.",
      });
      emailForm.reset();
    } catch (e) {
      let description = "An unexpected error occurred.";
      if (e instanceof FirebaseError) {
        if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
          description = "The current password you entered is incorrect.";
        } else if (e.code === 'auth/email-already-in-use') {
          description = "This email address is already in use by another account.";
        }
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: description,
      });
    } finally {
      setIsEmailLoading(false);
    }
  }
  
  async function onPasswordSubmit(data: PasswordFormValues) {
    if (!user || !user.email) return

    setIsPasswordLoading(true)
    try {
        const credential = EmailAuthProvider.credential(user.email, data.currentPassword)
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, data.newPassword)
        toast({
            title: "Password updated",
            description: "Your password has been changed successfully.",
        })
        passwordForm.reset()
    } catch (e) {
        let description = "An unexpected error occurred."
        if (e instanceof FirebaseError) {
            if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
                description = "The current password you entered is incorrect."
            }
        }
        toast({
            variant: "destructive",
            title: "Error",
            description: description,
        })
    } finally {
        setIsPasswordLoading(false)
    }
  }
  
  async function onAddPasswordSubmit(data: AddPasswordFormValues) {
    if (!user || !user.email) return;
    setIsPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, data.newPassword);
      await linkWithCredential(user, credential);
      toast({
        title: "Password Added",
        description: "You can now sign in with your email and password.",
      });
      addPasswordForm.reset();
      // Force a re-render or state update to reflect the change in auth provider
      router.refresh();
    } catch (e) {
      let description = "An unexpected error occurred.";
       if (e instanceof FirebaseError) {
        if (e.code === 'auth/credential-already-in-use') {
          description = "This account is already linked with another user.";
        } else if (e.code === 'auth/email-already-in-use') {
           description = "Your email is already associated with a password-based account. Please log in with your password to manage it.";
        }
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: description,
      });
    } finally {
      setIsPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    
    setIsDeleteLoading(true);
    try {
        if (user.providerData.some(p => p.providerId === 'password') && user.email) {
            const credential = EmailAuthProvider.credential(user.email, deleteConfirmationInput);
            await reauthenticateWithCredential(user, credential);
        }
        
        await deleteUser(user);
        toast({
            title: "Account Deleted",
            description: "Your account has been permanently deleted.",
        });
        router.push("/login");
    } catch (e) {
        let description = "An unexpected error occurred.";
        if (e instanceof FirebaseError) {
            if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
                description = "The password you entered is incorrect.";
            } else if (e.code === 'auth/requires-recent-login') {
                description = "This operation is sensitive and requires recent authentication. Please log in again before retrying."
            }
        }
        toast({
            variant: "destructive",
            title: "Error",
            description: description,
        });
    } finally {
        setIsDeleteLoading(false);
        setIsDeleteDialogOpen(false);
        setDeleteConfirmationInput("");
    }
  }
  
  const displayNameValue = profileForm.watch("displayName");
  const isPasswordUser = user?.providerData.some(p => p.providerId === 'password');
  
  const isDeleteButtonDisabled = isDeleteLoading || (isPasswordUser ? !deleteConfirmationInput : deleteConfirmationInput !== 'Delete');

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings.
            </p>
          </div>
           <Button variant="outline" onClick={() => setActiveView({ type: 'all' })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
           </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8 max-w-sm">
                <FormField
                    control={profileForm.control}
                    name="displayName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Your Name" {...field} maxLength={DISPLAY_NAME_MAX_LENGTH} />
                        </FormControl>
                        <div className="flex justify-between">
                            <FormDescription>
                                Your public display name.
                            </FormDescription>
                            <span className="text-sm text-muted-foreground">
                                {displayNameValue.length} / {DISPLAY_NAME_MAX_LENGTH}
                            </span>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" disabled={isProfileLoading || !profileForm.formState.isDirty || !profileForm.formState.isValid}>
                    {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isProfileLoading ? "Updating..." : "Update profile"}
                </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
      
       {isPasswordUser ? (
        <>
          <Card>
            <CardHeader>
                <CardTitle>Email Address</CardTitle>
                <CardDescription>Change the email address for your account. A verification link will be sent.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-8 max-w-sm">
                        <FormField
                            control={emailForm.control}
                            name="newEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Enter new email" {...field} maxLength={254} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={emailForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="Enter password to confirm" {...field} maxLength={100} />
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
                        <Button type="submit" disabled={isEmailLoading || !emailForm.formState.isValid}>
                            {isEmailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEmailLoading ? "Updating..." : "Update Email"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8  max-w-sm">
                      <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input type={showCurrentPassword ? 'text' : 'password'} {...field} maxLength={100} />
                                   <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                        >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input type={showNewPassword ? 'text' : 'password'} {...field} maxLength={100} />
                                   <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                              </FormControl>
                              <FormDescription>
                                  Must be at least 8 characters long.
                              </FormDescription>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <Button type="submit" disabled={isPasswordLoading || !passwordForm.formState.isDirty || !passwordForm.formState.isValid}>
                          {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isPasswordLoading ? "Updating..." : "Update password"}
                      </Button>
                      </form>
                  </Form>
              </CardContent>
          </Card>
        </>
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>Add Password</CardTitle>
                <CardDescription>Add a password to your account to sign in with your email address.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...addPasswordForm}>
                    <form onSubmit={addPasswordForm.handleSubmit(onAddPasswordSubmit)} className="space-y-8 max-w-sm">
                        <FormField
                            control={addPasswordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                <div className="relative">
                                    <Input type={showNewPassword ? 'text' : 'password'} {...field} maxLength={100} />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                </FormControl>
                                <FormDescription>
                                    Must be at least 8 characters long.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPasswordLoading || !addPasswordForm.formState.isValid}>
                            {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPasswordLoading ? "Adding..." : "Add Password"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      )}


      <Card className="border-destructive">
        <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
                <ShieldAlert /> Danger Zone
            </CardTitle>
            <CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
             <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
             </Button>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            {isPasswordUser ? (
                <div className="space-y-2">
                    <Label htmlFor="delete-confirmation-input">Please enter your password to confirm.</Label>
                     <div className="relative">
                        <Input 
                            id="delete-confirmation-input" 
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={deleteConfirmationInput}
                            onChange={(e) => setDeleteConfirmationInput(e.target.value)}
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
                </div>
            ) : (
                 <div className="space-y-2">
                    <Label htmlFor="delete-confirmation-input">To confirm, type <span className="font-bold text-foreground select-none">Delete</span> in the box below.</Label>
                    <Input 
                        id="delete-confirmation-input" 
                        type="text"
                        value={deleteConfirmationInput}
                        onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                        maxLength={6}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                    />
                </div>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={handleDeleteAccount} 
                    disabled={isDeleteButtonDisabled}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                    {isDeleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isDeleteLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
