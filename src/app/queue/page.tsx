'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useDuelStore } from '../../store/duelStore';
import { getSocket } from '../../lib/socket';
import type { Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/events';

function QueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'ranked';
  const joinRoomCode = searchParams.get('room');

  const { profile, accessToken } = useAuthStore();

  const [elapsed, setElapsed] = React.useState(0);
  const [createdRoomCode, setCreatedRoomCode] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const socketRef = React.useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  React.useEffect(() => {
    if (!profile || !accessToken) {
      router.replace('/');
      return;
    }

    const socket = getSocket(accessToken);
    socketRef.current = socket;
    useDuelStore.getState().setQueuing();

    if (mode === 'create_room') {
      socket.emit('room:create');
    } else if (joinRoomCode) {
      socket.emit('room:join', { code: joinRoomCode });
    } else if (mode === 'bot') {
      socket.emit('queue:join', { subject: 'math', isBot: true });
    } else {
      socket.emit('queue:join', { subject: 'math', isBot: false });
    }

    socket.on('room:created', ({ code }) => {
      setCreatedRoomCode(code);
    });

    socket.on('match:found', (payload) => {
      useDuelStore.getState().setMatchFound(payload.duelId, payload.opponent, payload.isBot);
      router.replace(`/duel/${payload.duelId}`);
    });

    socket.on('error', (err) => {
      setErrorMessage(err.message || 'An error occurred');
    });

    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);

    return () => {
      clearInterval(timer);
      socket.off('room:created');
      socket.off('match:found');
      socket.off('error');
    };
  }, [profile, accessToken, mode, joinRoomCode, router]);

  const handleCancel = () => {
    socketRef.current?.emit('queue:leave');
    useDuelStore.getState().reset();
    router.replace('/home');
  };

  const isRoomMode = mode === 'create_room';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
      {/** Indikator mode pencarian */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-primary-600/20 border border-primary-500/30 rounded-full flex items-center justify-center font-black text-primary-400 text-lg tracking-widest mx-auto animate-pulse">
          {isRoomMode ? 'ROOM' : mode === 'bot' ? 'BOT' : 'MATCH'}
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 animate-ping pointer-events-none" />
      </div>

      <h1 className="text-2xl font-black mb-2">
        {isRoomMode
          ? 'Menunggu Teman Bergabung...'
          : mode === 'bot'
          ? 'Menyiapkan Duel vs Bot...'
          : 'Mencari Lawan...'}
      </h1>

      {isRoomMode && createdRoomCode && (
        <div className="card my-4 py-4 px-6 bg-gray-900 border-primary-500">
          <p className="text-xs text-gray-400 mb-1">Bagikan kode ini ke temanmu:</p>
          <div className="text-4xl font-black tracking-widest text-primary-400 select-all font-mono">
            {createdRoomCode}
          </div>
        </div>
      )}

      <p className="text-gray-400 text-sm max-w-xs mb-4">
        {isRoomMode
          ? 'Duel akan otomatis dimulai saat temanmu memasukkan kode.'
          : elapsed >= 10
          ? 'Belum ada lawan yang seimbang, mengalihkan ke duel vs Bot...'
          : 'Mencari pemain lain dengan rating setara...'}
      </p>

      {/** Durasi waktu antrean */}
      <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-1.5 rounded-full text-xs font-mono text-gray-400 mb-8">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span>{elapsed} detik</span>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 mb-6">
          {errorMessage}
        </div>
      )}

      <button onClick={handleCancel} className="btn-secondary py-3.5 max-w-xs">
        Batal
      </button>
    </main>
  );
}

export default function QueuePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-gray-400">
          Memuat antrean...
        </main>
      }
    >
      <QueueContent />
    </Suspense>
  );
}
