'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function LandingClient() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (profile?.nickname) {
      router.replace('/home');
    }
  }, [profile, router]);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        useAuthStore.getState().setAccessToken(session.access_token);

        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (prof?.nickname) {
          useAuthStore.getState().setProfile(prof);
          router.replace('/home');
        } else {
          router.replace('/setup-nickname');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/home` : undefined,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        setError(error.message);
        return;
      }
      if (data?.session) {
        useAuthStore.getState().setAccessToken(data.session.access_token);
        router.replace('/setup-nickname');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in as guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-full flex flex-col items-center text-center mb-10">
        <div className="w-20 h-20 bg-primary-600/20 border border-primary-500/30 rounded-3xl flex items-center justify-center text-primary-400 font-black text-2xl mb-4 shadow-xl shadow-primary-500/10 tracking-wider">
          SC
        </div>
        <h1 className="text-4xl font-black tracking-tight">Study Clash</h1>
        <span className="text-primary-400 font-extrabold tracking-widest text-sm mt-1 uppercase">
          Ranked Duel
        </span>
        <p className="text-gray-400 text-sm mt-3 max-w-xs">
          Duel matematika 1 vs 1 online. Soal sama, waktu terbatas — siapa paling tepat dan cepat?
        </p>
      </div>

      <div className="w-full flex flex-col gap-3.5">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-primary flex items-center justify-center gap-3 py-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Masuk dengan Google
        </button>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="btn-secondary py-3.5"
        >
          {loading ? 'Memproses...' : 'Main Langsung (Mode Tamu)'}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 text-center mt-2">
            {error}
          </div>
        )}
      </div>

      <p className="text-gray-500 text-xs mt-10 text-center">
        Gratis untuk siswa · Tanpa iklan · Privasi terjaga
      </p>
    </main>
  );
}
