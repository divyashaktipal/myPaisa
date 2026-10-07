import { MongoClient, type Db } from "mongodb";
import { env } from "@/config";
import type { GlobalMongo, UserDocument, WatchlistToggleResult } from "@/types/mongodb";

export type { UserDocument, GlobalMongo, WatchlistToggleResult };

const uri = env.MONGODB_URI;

const globalWithMongo = global as typeof globalThis & GlobalMongo;

let clientPromise: Promise<MongoClient>;

if (env.IS_DEV) {
  // In development, preserve MongoDB client across Next.js HMR reloads
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
export { clientPromise };

// In-memory fallback if MongoDB instance is temporarily unreachable
const inMemoryWatchlist = new Set<string>(["TRENT", "BSE", "KOTAKBANK", "RELIANCE", "TCS"]);

export async function getMongoClient(): Promise<MongoClient | null> {
  try {
    return await clientPromise;
  } catch (err) {
    console.error("Failed to obtain MongoClient:", err);
    return null;
  }
}

export async function getDatabase(dbName = "myPaisa"): Promise<Db | null> {
  try {
    const client = await getMongoClient();
    if (!client) return null;
    return client.db(dbName);
  } catch (err) {
    console.error("Failed to obtain Database:", err);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<UserDocument | null> {
  try {
    const db = await getDatabase();
    if (!db) return null;
    const doc = await db.collection("users").findOne({ email });
    return doc as unknown as UserDocument | null;
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  }
}

export async function syncUserOnLogin(user: {
  name?: string | null;
  email: string;
  image?: string | null;
  googleId?: string | null;
}) {
  if (!user.email) return;
  try {
    const db = await getDatabase();
    if (!db) return;
    const now = new Date();
    await db.collection("users").updateOne(
      { email: user.email },
      {
        $set: {
          name: user.name,
          image: user.image,
          lastLoginAt: now,
          updatedAt: now,
          provider: "google",
          ...(user.googleId ? { googleId: user.googleId } : {}),
        },
        $setOnInsert: {
          role: "trader",
          createdAt: now,
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("Error syncing user to MongoDB:", err);
  }
}

export async function getWatchlist(userId = "default_user"): Promise<string[]> {
  try {
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection("watchlists").findOne({ userId });
      if (doc?.symbols && Array.isArray(doc?.symbols)) {
        return doc.symbols;
      }
    }
  } catch {
    // Fallback to in-memory
  }
  return Array.from(inMemoryWatchlist);
}

export async function toggleWatchlist(symbol: string, userId = "default_user"): Promise<WatchlistToggleResult> {
  const cleanSymbol = symbol.toUpperCase().trim();
  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection("watchlists");
      const doc = await collection.findOne({ userId });
      let symbols: string[] = doc?.symbols || Array.from(inMemoryWatchlist);
      const exists = symbols.includes(cleanSymbol);
      if (exists) {
        symbols = symbols.filter((s) => s !== cleanSymbol);
      } else {
        symbols.push(cleanSymbol);
      }
      await collection.updateOne(
        { userId },
        { $set: { userId, symbols, updatedAt: new Date() } },
        { upsert: true }
      );
      return { added: !exists, symbols };
    }
  } catch {
    // Fallback to in-memory
  }

  const exists = inMemoryWatchlist.has(cleanSymbol);
  if (exists) {
    inMemoryWatchlist.delete(cleanSymbol);
  } else {
    inMemoryWatchlist.add(cleanSymbol);
  }
  return { added: !exists, symbols: Array.from(inMemoryWatchlist) };
}
