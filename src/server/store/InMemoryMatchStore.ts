import type { MatchStore, QueueEntry, ActiveDuel } from './MatchStore';

/**
 * Implementasi in-memory MatchStore untuk MVP.
 * Untuk produksi skala besar, ganti dengan RedisMatchStore
 * tanpa mengubah logika duel sama sekali.
 */
export class InMemoryMatchStore implements MatchStore {
  /** Pemetaan ID pengguna ke entri antrean */
  private queue = new Map<string, QueueEntry>();
  /** Pemetaan ID duel ke data duel aktif */
  private duels = new Map<string, ActiveDuel>();
  /** Pemetaan ID pengguna ke ID duel yang sedang berjalan */
  private userDuel = new Map<string, string>();
  /** Pemetaan ID pengguna ke ID socket koneksi */
  private userSocket = new Map<string, string>();

  enqueue(entry: QueueEntry) { this.queue.set(entry.userId, entry); }
  dequeue(userId: string)    { this.queue.delete(userId); }
  isInQueue(userId: string)  { return this.queue.has(userId); }

  getQueue(subject: string): QueueEntry[] {
    return Array.from(this.queue.values()).filter(e => e.subject === subject);
  }

  createDuel(duel: ActiveDuel) {
    this.duels.set(duel.duelId, duel);
    this.userDuel.set(duel.player1.userId, duel.duelId);
    if (duel.player2 && !duel.player2.isBot) {
      this.userDuel.set(duel.player2.userId, duel.duelId);
    }
  }

  getDuel(duelId: string) { return this.duels.get(duelId) ?? null; }

  updateDuel(duelId: string, updates: Partial<ActiveDuel>) {
    const d = this.duels.get(duelId);
    if (d) Object.assign(d, updates);
  }

  deleteDuel(duelId: string) {
    const d = this.duels.get(duelId);
    if (d) {
      this.userDuel.delete(d.player1.userId);
      if (d.player2 && !d.player2.isBot) this.userDuel.delete(d.player2.userId);
    }
    this.duels.delete(duelId);
  }

  getActiveDuelByUser(userId: string) {
    const id = this.userDuel.get(userId);
    return id ? (this.duels.get(id) ?? null) : null;
  }

  setUserSocket(userId: string, socketId: string) { this.userSocket.set(userId, socketId); }
  getUserSocket(userId: string)                   { return this.userSocket.get(userId) ?? null; }
  removeUserSocket(userId: string)                { this.userSocket.delete(userId); }
}
