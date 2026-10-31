# Study-Clash-Ranked

> Proyek hackathon. Duel matematika 1 vs 1 online dengan sistem ranking dan leaderboard.

## 👥 Tim

| Nama | Peran | GitHub |
| ---- | ----- | ------ |
|      |       |        |

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Auth: Google OAuth + login tamu/anonymous)

## 🚀 Cara Menjalankan

Butuh Node.js 20+ dan npm.

```bash
git clone https://github.com/zalvarel/Study-Clash-Ranked.git
cd Study-Clash-Ranked
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev                  # buka http://localhost:3000
```

Perintah lain:

| Perintah        | Fungsi                     |
| --------------- | -------------------------- |
| `npm run dev`   | Jalankan server development |
| `npm run build` | Build untuk production      |
| `npm run start` | Jalankan hasil build        |
| `npm run lint`  | Cek kode dengan ESLint      |

### Setup Supabase

1. Buat project di [Supabase](https://supabase.com/), salin **Project URL** dan **anon key** ke `.env.local`.
2. **Authentication > Sign In / Providers**: aktifkan **Google** (isi Client ID & Secret dari Google Cloud) dan **Allow anonymous sign-ins**.
3. **Authentication > URL Configuration**: tambahkan `http://localhost:3000/auth/callback` (dan URL production) ke **Redirect URLs**.

### Halaman

| Route            | Isi                                                    |
| ---------------- | ------------------------------------------------------ |
| `/`              | Redirect ke `/login`                                   |
| `/login`         | Masuk dengan Google atau main sebagai tamu             |
| `/auth/callback` | Menunggu session dari Google lalu ke `/lobby`          |
| `/lobby`         | Lobby sementara (nama, status, tombol keluar)          |

## 🤝 Kontribusi

Baca [CONTRIBUTING.md](CONTRIBUTING.md) sebelum mulai kerja.
