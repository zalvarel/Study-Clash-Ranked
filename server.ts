import { createServer } from "http";
import { networkInterfaces } from "os";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "./src/shared/events";
import { db } from "./src/server/db";
import { InMemoryMatchStore } from "./src/server/store/InMemoryMatchStore";
import { registerSocketHandlers } from "./src/server/socketHandlers";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

console.log(
  `> Initializing Next.js app in ${dev ? "development" : "production"} mode...`,
);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function getNetworkUrls(portNumber: number): string[] {
  const urls: string[] = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family === "IPv4" && !addr.internal) {
        urls.push(`http://${addr.address}:${portNumber}`);
      }
    }
  }
  return urls;
}

async function bootstrap() {
  await app.prepare();

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || ["*"],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  const matchStore = new InMemoryMatchStore();

  {
    /** Autentikasi Socket.IO via token JWT Supabase */
  }
  io.use(async (socket, nextMiddleware) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        return nextMiddleware(new Error("AUTH_REQUIRED"));
      }

      {
        /** Verifikasi token user */
      }
      const { data, error } = await db.auth.getUser(token);
      if (error || !data.user) {
        return nextMiddleware(new Error("AUTH_INVALID"));
      }

      const userId = data.user.id;

      {
        /** Ambil profil pengguna */
      }
      const { data: profile } = await db
        .from("profiles")
        .select("id, nickname, rating")
        .eq("id", userId)
        .single();

      socket.data.userId = userId;
      socket.data.nickname = profile?.nickname || "Player";
      socket.data.rating = profile?.rating || 1000;

      nextMiddleware();
    } catch (err) {
      nextMiddleware(new Error("AUTH_ERROR"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `[Socket.IO] Connected: ${socket.data.nickname} (${socket.data.userId})`,
    );
    registerSocketHandlers(io, socket, matchStore);
  });

  server.listen(port, () => {
    console.log(`> Study Clash Ranked running at:`);
    console.log(`  - Local:   http://localhost:${port}`);
    const networkUrls = getNetworkUrls(port);
    if (networkUrls.length > 0) {
      networkUrls.forEach((url, i) => {
        console.log(`  - ${i === 0 ? "Network:" : "         "} ${url}`);
      });
    } else {
      console.log(`  - Network: (tidak ada koneksi jaringan lokal terdeteksi)`);
    }
    console.log(`> Ready for connections!`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
