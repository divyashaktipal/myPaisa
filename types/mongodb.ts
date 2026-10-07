import type { MongoClient } from "mongodb";

export interface GlobalMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

export interface UserDocument {
  _id?: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role?: string;
  provider?: string;
  googleId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

export interface WatchlistToggleResult {
  added: boolean;
  symbols: string[];
}
