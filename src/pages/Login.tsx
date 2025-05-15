
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-mint to-wellness-sky p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-white/80 backdrop-blur-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Mental Wellness Buddy</h1>
          <p className="text-muted-foreground">Sign in to start your wellness journey</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={['google']} 
          redirectTo={window.location.origin}
        />
      </Card>
    </div>
  );
};

export default Login;
