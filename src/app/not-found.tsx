import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
      <div className="text-6xl font-black text-primary-500 mb-4 font-mono">404</div>
      <h1 className="text-2xl font-black mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-gray-400 text-sm mb-6">
        Halaman yang kamu cari tidak ada atau duel sudah berakhir.
      </p>
      <Link href="/" className="btn-primary py-3.5 max-w-xs text-center inline-block">
        Kembali ke Beranda
      </Link>
    </main>
  );
}
