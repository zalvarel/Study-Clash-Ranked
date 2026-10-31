'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

interface LeaderboardEntry {
  id: string;
  nickname: string;
  school: string | null;
  rating: number;
  games_played: number;
  rank: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase
      .from('leaderboard_global')
      .select('*')
      .order('rank', { ascending: true })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data) {
          setEntries(data as LeaderboardEntry[]);
        }
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen flex flex-col p-4 max-w-sm mx-auto">
      {/** Header navigasi */}
      <div className="flex items-center gap-3 mb-6 mt-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-black">Leaderboard Global</h1>
          <p className="text-xs text-gray-400">Peringkat 50 teratas</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-16 text-sm">
          Memuat peringkat...
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-sm font-bold text-gray-300">Belum ada duel yang tercatat</p>
          <p className="text-xs text-gray-500 mt-1">
            Jadilah yang pertama bermain duel dan capai puncak!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 pb-6">
          {entries.map((entry) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;

            return (
              <div
                key={entry.id}
                className={`card flex items-center gap-3 p-3.5 ${
                  isTop1
                    ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-950/20 to-gray-900'
                    : isTop2
                    ? 'border-gray-400/50 bg-gradient-to-r from-gray-800/20 to-gray-900'
                    : isTop3
                    ? 'border-amber-700/50 bg-gradient-to-r from-amber-950/20 to-gray-900'
                    : 'border-gray-800'
                }`}
              >
                <div
                  className={`w-8 text-center font-black font-mono text-sm ${
                    isTop1
                      ? 'text-yellow-400 font-extrabold'
                      : isTop2
                      ? 'text-gray-300'
                      : isTop3
                      ? 'text-amber-500'
                      : 'text-gray-500'
                  }`}
                >
                  #{entry.rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">{entry.nickname}</div>
                  {entry.school && (
                    <div className="text-xs text-gray-500 truncate">{entry.school}</div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-sm text-primary-400">
                    {entry.rating}
                  </div>
                  <div className="text-[10px] text-gray-500">{entry.games_played} duel</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
