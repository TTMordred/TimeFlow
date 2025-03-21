
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Mail, 
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);

  // Redirect if user is logged in
  if (user && !loading) {
    return <Navigate to="/" />;
  }

  const validatePassword = (value: string) => {
    // Password requirements
    const minLength = value.length >= 8;
    const containsNumber = /\d/.test(value);
    const containsSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const containsUppercase = /[A-Z]/.test(value);

    setHasMinLength(minLength);
    setHasNumber(containsNumber);
    setHasSpecial(containsSpecial);
    setHasUppercase(containsUppercase);

    // Calculate strength (25% for each requirement)
    const strength = [minLength, containsNumber, containsSpecial, containsUppercase]
      .filter(Boolean).length * 25;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (!isLogin) {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!isLogin && passwordStrength < 75) {
        toast.error("Please use a stronger password");
        setIsSubmitting(false);
        return;
      }

      let error;
      if (isLogin) {
        const result = await signIn(email, password);
        error = result.error;
      } else {
        const result = await signUp(email, password);
        error = result.error;
      }

      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'An error occurred with Google sign in');
    } finally {
      setTimeout(() => setIsGoogleLoading(false), 5000);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-timeflow-green-500 rounded-lg mr-3 flex items-center justify-center">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-semibold tracking-tight">TimeFlow</span>
          </div>
        </div>

        <div className="glass rounded-xl p-8">
          <h1 className="text-2xl font-semibold mb-2 text-center">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {isLogin 
              ? 'Sign in to continue your productivity journey'
              : 'Join us to start tracking your time effectively'
            }
          </p>

          <Button 
            type="button" 
            variant="outline"
            className="w-full mb-6"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Connecting...
              </div>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
              </div>
              
              {!isLogin && password.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Progress value={passwordStrength} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Password strength: {passwordStrength}%
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {hasMinLength ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {hasUppercase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>One uppercase letter</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {hasNumber ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>One number</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {hasSpecial ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>

            {isLogin && (
              <div className="text-sm text-center">
                <button
                  type="button"
                  className="text-primary hover:underline focus:outline-none"
                  onClick={() => toast.info(
                    "Password Reset",
                    { description: "This feature will be available soon!" }
                  )}
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-primary hover:underline focus:outline-none"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <button 
              className="text-primary hover:underline"
              onClick={() => toast.info(
                "Terms of Service",
                { description: "Terms of Service will be available soon!" }
              )}
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              className="text-primary hover:underline"
              onClick={() => toast.info(
                "Privacy Policy",
                { description: "Privacy Policy will be available soon!" }
              )}
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
