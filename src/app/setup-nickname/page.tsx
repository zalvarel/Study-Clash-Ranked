'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function SetupNicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = React.useState('');
  const [school, setSchool] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const validateNickname = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.length < 3) return 'Nickname minimal 3 karakter';
    if (trimmed.length > 16) return 'Nickname maksimal 16 karakter';
    if (/\s{2,}/.test(trimmed)) return 'Tidak boleh ada spasi berlebih';
    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
      return 'Hanya boleh berisi huruf, angka, spasi, _, atau -';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    const validationError = validateNickname(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/');
        return;
      }

      const { data: prof, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          nickname: trimmed,
          school: school.trim() || null,
          rating: 1000,
          games_played: 0,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Nickname sudah dipakai. Silakan pilih nickname lain.');
        } else {
          setError(insertError.message);
        }
        return;
      }

      if (prof) {
        useAuthStore.getState().setProfile(prof);
        useAuthStore.getState().setAccessToken(session.access_token);
        router.replace('/home');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-sm mx-auto">
      <div className="w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500/20 border border-primary-500/30 rounded-2xl flex items-center justify-center text-primary-400 font-bold text-sm mx-auto mb-3 tracking-wider">
            PROFILE
          </div>
          <h1 className="text-2xl font-black">Pilih Nickname Kamu</h1>
          <p className="text-gray-400 text-sm mt-1">Lawan hanya akan melihat nickname ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
              Nickname (3-16 karakter) *
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="contoh: BimaJuara"
              maxLength={16}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-base"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
              Sekolah (opsional)
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="contoh: SMA Negeri 1"
              maxLength={40}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 text-base"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !nickname.trim()}
            className="btn-primary mt-2"
          >
            {loading ? 'Menyimpan...' : 'Mulai Bermain!'}
          </button>
        </form>
      </div>
    </main>
  );
}
