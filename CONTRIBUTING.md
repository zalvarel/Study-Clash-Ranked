# Panduan Kontribusi

Aturan singkat supaya kerja tim lancar dan minim konflik.

## Alur Kerja

1. **Selalu update `main` dulu** sebelum bikin branch baru:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Buat branch baru** per fitur/perbaikan (jangan kerja langsung di `main`):
   ```bash
   git checkout -b feat/nama-fitur
   ```
3. Commit kecil dan sering.
4. Push branch, lalu buka **Pull Request** ke `main`.
5. Minta minimal **1 anggota tim** untuk review sebelum merge.
6. Setelah merge, hapus branch-nya.

## Penamaan Branch

| Prefix      | Untuk                          | Contoh                 |
| ----------- | ------------------------------ | ---------------------- |
| `feat/`     | Fitur baru                     | `feat/login-page`      |
| `fix/`      | Perbaikan bug                  | `fix/skor-tidak-update`|
| `docs/`     | Dokumentasi                    | `docs/update-readme`   |
| `refactor/` | Rapikan kode tanpa ubah fitur  | `refactor/api-client`  |
| `chore/`    | Setup, config, dependency      | `chore/setup-eslint`   |

## Format Pesan Commit

Pakai format [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipe>: <deskripsi singkat>
```

Contoh:
- `feat: tambah halaman leaderboard`
- `fix: perbaiki perhitungan ranking`
- `docs: tambah cara install di README`
- `chore: setup prettier`

## Tips Menghindari Konflik

- Bagi tugas per file/folder sejelas mungkin.
- Rutin `git pull origin main` ke branch kamu (atau `git rebase main`).
- Jangan commit file `.env`, `node_modules/`, atau hasil build.
- Kalau konflik, diskusikan dulu dengan pemilik kode sebelum menimpa.
