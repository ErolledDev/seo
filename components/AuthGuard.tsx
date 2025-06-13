'use client';

import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (action: 'signin' | 'signup') => {
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === 'signin') {
        await signIn(email, password);
        toast({ title: 'Success', description: 'Signed in successfully' });
      } else {
        await signUp(email, password);
        toast({ title: 'Success', description: 'Account created successfully' });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/api-key-not-valid':
            errorMessage = 'Firebase configuration error. Please contact support.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          default:
            errorMessage = error.message || `Failed to ${action === 'signin' ? 'sign in' : 'create account'}`;
        }
      }

      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email first',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await resetPassword(email);
      toast({ title: 'Success', description: 'Password reset email sent' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
        variant: 'destructive',
      });
    }
  };

  // Check if Firebase is properly configured
  const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                               process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
                               process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'build-placeholder';

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-900">Configuration Error</CardTitle>
            <CardDescription className="text-red-700">
              Firebase is not properly configured for this deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Missing Configuration</h3>
              <p className="text-sm text-red-800 mb-3">
                The Firebase API key and project configuration are missing or invalid.
              </p>
              <div className="text-xs text-red-700 space-y-1">
                <p>• API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing'}</p>
                <p>• Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Present' : 'Missing'}</p>
                <p>• Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing'}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">For Developers</h3>
              <p className="text-sm text-blue-800">
                Please set the Firebase environment variables in your deployment platform:
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1">
                <li>• NEXT_PUBLIC_FIREBASE_API_KEY</li>
                <li>• NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                <li>• NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
                <li>• NEXT_PUBLIC_FIREBASE_APP_ID</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription>
              Sign in to access the SEO Redirect Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={(e) => { e.preventDefault(); handleAuth('signin'); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={handleResetPassword} 
                    className="text-sm"
                    disabled={isSubmitting}
                  >
                    Forgot Password?
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={(e) => { e.preventDefault(); handleAuth('signup'); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 6 characters)"
                      required
                      minLength={6}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}