'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { disconnectSocket } from '../../lib/socket';

export default function HomePage() {
  const router = useRouter();
  const { profile, clear } = useAuthStore();
  const [showRoomModal, setShowRoomModal] = React.useState(false);
  const [roomCodeInput, setRoomCodeInput] = React.useState('');

  React.useEffect(() => {
    if (!profile) {
      router.replace('/');
    }
  }, [profile, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    disconnectSocket();
    clear();
    router.replace('/');
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length === 4) {
      router.push(`/queue?room=${code}`);
    }
  };

  if (!profile) return null;

  return (
    <main className="min-h-screen flex flex-col p-5 max-w-sm mx-auto justify-between">
      <div>
        {/** Header profil */}
        <div className="flex items-center justify-between mt-3 mb-6">
          <div>
            <p className="text-gray-400 text-xs font-medium">Hai, selamat datang</p>
            <h1 className="text-xl font-black text-white">{profile.nickname}</h1>
            {profile.school && <p className="text-gray-500 text-xs">{profile.school}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-red-400 border border-gray-800 hover:border-red-900/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Keluar
          </button>
        </div>

        {/** Kartu rating */}
        <div className="card text-center mb-6 bg-gradient-to-b from-gray-900 to-gray-900/80 border-primary-500/20">
          <p className="text-xs font-bold text-primary-400 uppercase tracking-widest">
            Rating Matematika
          </p>
          <div className="text-5xl font-black text-white my-2 tracking-tight">
            {profile.rating}
          </div>
          <p className="text-xs text-gray-500">{profile.games_played} duel telah dimainkan</p>
        </div>

        {/** Tombol aksi utama */}
        <div className="flex flex-col gap-3.5">
          <button
            onClick={() => router.push('/queue?mode=ranked')}
            className="btn-primary py-5 text-xl"
          >
            Cari Lawan (Ranked)
          </button>

          <button
            onClick={() => router.push('/queue?mode=bot')}
            className="btn-secondary py-4"
          >
            Latihan vs Bot
          </button>

          <button
            onClick={() => setShowRoomModal(true)}
            className="btn-secondary py-4"
          >
            Main dengan Teman (Kode Room)
          </button>

          <button
            onClick={() => router.push('/leaderboard')}
            className="btn-secondary py-3.5 text-sm"
          >
            Leaderboard Global
          </button>
        </div>
      </div>

      {/** Footer info */}
      <footer className="text-center text-gray-600 text-xs py-4 mt-6">
        Study Clash Ranked
      </footer>

      {/** Modal room kode */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-xs p-6 bg-gray-900 border-gray-700">
            <h2 className="text-lg font-black mb-1 text-center">Main dengan Teman</h2>
            <p className="text-xs text-gray-400 text-center mb-5">
              Buat room baru atau masukkan kode dari temanmu.
            </p>

            <button
              onClick={() => router.push('/queue?mode=create_room')}
              className="btn-primary py-3 mb-4 text-base"
            >
              Buat Room Baru
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-800"></div>
              <span className="flex-shrink mx-2 text-gray-500 text-xs uppercase">atau</span>
              <div className="flex-grow border-t border-gray-800"></div>
            </div>

            <form onSubmit={handleJoinRoom} className="flex flex-col gap-3 mt-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="4 KODE ROOM (misal: K7X2)"
                maxLength={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest text-white uppercase focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                disabled={roomCodeInput.trim().length !== 4}
                className="btn-secondary py-3 text-sm"
              >
                Gabung Room
              </button>
            </form>

            <button
              onClick={() => setShowRoomModal(false)}
              className="w-full text-center text-gray-500 text-xs hover:text-white mt-4"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
