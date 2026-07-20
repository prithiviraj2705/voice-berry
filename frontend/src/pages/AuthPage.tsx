import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Globe, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const AuthPage = () => {
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  // If already logged in, redirect
  React.useEffect(() => {
    if (session) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      const fromState = (location.state as any)?.from?.state;
      navigate(from, { state: fromState, replace: true });
    }
  }, [session, navigate, location]);

  const handleSendLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (signInError) throw signInError;
      
      setStep('sent');
    } catch (err: any) {
      console.error('Error sending sign-in link:', err);
      setError(err.message || 'Failed to send link. Please try again or check API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/30 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>
      
      <div className="p-6 flex justify-between items-center relative z-10">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <Globe className="w-4 h-4 mr-2" />
          EN
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 shadow-2xl border-none bg-card relative">
            {error && (
              <div className="absolute -top-14 left-0 right-0 bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-accent mb-2">Ulacab</h2>
              <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
              <p className="text-muted-foreground text-sm mt-2">
                {step === 'email' ? 'Enter your email to sign in or create an account.' : 'Check your email'}
              </p>
            </div>

            {step === 'email' ? (
              <form onSubmit={handleSendLink} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="Email address" 
                      className="pl-10 h-12 bg-muted/50 border-transparent focus-visible:ring-accent" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Sign-In Link'}
                </Button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <p className="text-foreground">
                  We've sent a sign-in link to <strong>{email}</strong>.
                </p>
                <p className="text-muted-foreground text-sm">
                  Click the link to continue. You can close this window.
                </p>
                
                <div className="pt-6 space-y-4">
                  <Button 
                    onClick={() => handleSendLink()} 
                    disabled={isLoading} 
                    variant="outline"
                    className="w-full h-12 text-base font-semibold"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Resend link'}
                  </Button>
                  <div>
                    <button 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                      onClick={() => setStep('email')}
                      disabled={isLoading}
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
